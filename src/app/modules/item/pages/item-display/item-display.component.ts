import { AfterViewChecked, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ItemData } from '../../services/item-datasource.service';
import { CompleteFunction, ErrorFunction, Platform, Task, TaskParams, TaskProxyManager } from 'src/app/shared/task/task-xd-pr';
import { interval, Observable, Subscriber, Subscription } from 'rxjs';
import { TaskTokensService } from 'src/app/shared/http-services/task-tokens.service';
import { throttleTime } from 'rxjs/operators';
import { AnswerActionsService } from 'src/app/shared/http-services/answer-actions.service';

interface TaskTab {
  name: string
}

@Component({
  selector: 'alg-item-display',
  templateUrl: './item-display.component.html',
  styleUrls: [ './item-display.component.scss' ]
})
export class ItemDisplayComponent implements OnInit, AfterViewChecked, OnDestroy {
  @Input() itemData?: ItemData;
  @ViewChild('iframe') iframe?: ElementRef<HTMLIFrameElement>;

  state : 'loading' | 'loaded' | 'unloading';
  urlSet = false;
  url? : SafeResourceUrl;
  msg = '';

  tabs: TaskTab[] = [];
  activeTab: TaskTab;

  taskProxyManager: TaskProxyManager;
  task?: Task;
  platform? : Platform;

  height: number;
  heightInterval? : Subscription;

  lastAnswer = '';
  lastState = '';
  answerCheckInterval? : Subscription;
  answerSaveInterval? : Subscription;
  answerSaveSubscriber? : Subscriber<void>;
  saving = false; // currently unused

  constructor(
    private sanitizer: DomSanitizer,
    private answerActionsService: AnswerActionsService,
    private taskTokensService: TaskTokensService
  ) {
    this.state = 'loading';
    this.setUrl('about:blank');
    this.height = 400;
    const initialTab = { name: 'Task' };
    this.tabs = [ initialTab ];
    this.tabs.push({ name: 'Editor' });
    this.activeTab = initialTab;
    this.taskProxyManager = new TaskProxyManager();
  }


  // Lifecycle functions
  ngOnInit(): void {
    if (!this.itemData || !this.itemData.currentResult) {
      return;
    }
    //const url = this.itemData?.item.url || '';
    const url = "https://bebras.mblockelet.info/exampleTable/";
    this.taskTokensService.getTaskToken(this.itemData.item.id, this.itemData.currentResult.attemptId)
      .subscribe(token => {
        this.setUrl(this.taskProxyManager.getUrl(url, token, 'http://algorea.pem.dev', 'task-'));
        this.urlSet = true;
      });
  }

  ngAfterViewChecked(): void {
    // Wait for the iframe to actually load the URL
    this.taskIframeUrlSet();
  }

  ngOnDestroy(): void {
    this.heightInterval?.unsubscribe();
    this.answerCheckInterval?.unsubscribe();
    this.answerSaveInterval?.unsubscribe();
    this.taskProxyManager.deleteTaskProxy();
  }


  // Iframe URL set
  taskIframeUrlSet(): void {
    if (this.iframe && this.urlSet && !this.task) {
      const iframe = this.iframe.nativeElement;
      this.taskProxyManager.getTaskProxy(iframe, this.taskIframeLoaded.bind(this), false);
    }
  }

  // Task iframe is ready
  taskIframeLoaded(task: Task): void {
    this.task = task;
    const taskParams = { minScore: -3, maxScore: 10, randomSeed: 0, noScore: 0, readOnly: false, options: {} };
    this.platform = new ItemDisplayPlatform(task, taskParams);
    this.task.setPlatform(this.platform);

    const initialViews = { task: true, solution: true, editor: true, hints: true, grader: true, metadata: true };
    task.load(initialViews, this.taskLoaded.bind(this));
  }

  // task.load done
  taskLoaded(): void {
    this.state = 'loaded';

    this.updateHeight();
    this.heightInterval = interval(1000).subscribe(() => this.updateHeight());

    // Check answer for changes every 10s, and save it every 60s
    this.answerCheckInterval = interval(10000).subscribe(() => this.getAnswerState());
    this.answerSaveInterval = new Observable(subscriber => {
      this.answerSaveSubscriber = subscriber;
    })
      .pipe(throttleTime(60000, undefined, { leading: true, trailing: true }))
      .subscribe(() => {
        this.saveAnswerState();
      });

    this.task?.showViews({ task: true }, () => {});

    this.task?.getViews((views : any) => {
      this.setViews(views);
    });
  }

  // Answer management
  getAnswerState(): void {
    // Gets the answer from the task, saves it if new
    this.task?.getAnswer((answer : string) => {
      this.task?.getState((state: string) => {
        if (answer != this.lastAnswer || state != this.lastState) {
          this.lastAnswer = answer;
          this.lastState = state;
          this.answerSaveSubscriber?.next();
        }
      });
    });
  }

  reloadAnswerState(answer : string, state : string, callback : CompleteFunction): void {
    // Reloads an answer into the task
    this.task?.reloadAnswer(answer, () => {
      this.task?.reloadState(state, callback);
    });
  }

  saveAnswerState(): void {
    // Saves the answer to the backend
    this.saving = true;
    this.answerActionsService.updateCurrent(
      this.itemData?.item.id || '',
      this.itemData?.currentResult?.attemptId || '',
      this.lastAnswer,
      this.lastState
    )
      .subscribe(() => {
        this.saving = false;
      });
  }

  updateHeight(): void {
    this.task?.getHeight(this.setHeight.bind(this));
  }

  // Views management
  setViews(_views : any) : void {
    // TODO
  }

  // Utility functions
  setHeight(height: number): void {
    this.height = height;
  }

  setUrl(url : string): void {
    this.url = url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : undefined;
  }

  setActiveTab(tab: TaskTab): void {
    this.activeTab = tab;
  }
}

export class ItemDisplayPlatform extends Platform {
  taskParams: any;
  constructor(task: Task, taskParams: TaskParams) {
    super(task);
    this.taskParams = taskParams;
  }

  validate(mode : string, success : CompleteFunction, _error : ErrorFunction) : void {
    if (mode == 'cancel') {
      // TODO reload answer
    }
    if (mode == 'validate') {
      this.task.getAnswer((answer: string) => {
        this.task.gradeAnswer(answer, '', (results : any) => {
          success(results);
        });
      });
    }
  }

  getTaskParams(_key : string | undefined, _defaultValue : any, success : (result : any) => void, _? : ErrorFunction) : void {
    success(this.taskParams);
  }
}
