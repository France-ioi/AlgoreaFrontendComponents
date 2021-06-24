import { AfterViewChecked, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ItemData } from '../../services/item-datasource.service';
import { CompleteFunction, ErrorFunction, Platform, Task, TaskParams, TaskProxyManager } from 'src/app/shared/task/task-xd-pr';
import { interval, merge, Observable, of, Subscriber, Subscription } from 'rxjs';
import { LayoutService } from 'src/app/shared/services/layout.service';
import { AnswerActionsService } from 'src/app/shared/http-services/answer-actions.service';
import { TaskTokensService } from 'src/app/shared/http-services/task-tokens.service';
import { first, mergeMap, switchMap, throttleTime } from 'rxjs/operators';
import { CurrentContentService } from 'src/app/shared/services/current-content.service';
import { isItemInfo } from 'src/app/shared/models/content/item-info';
import { UserSessionService } from 'src/app/shared/services/user-session.service';

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

  classes : string[] = [];

  state : 'loading' | 'loaded' | 'unloading';
  urlSet = false;
  url? : SafeResourceUrl;
  msg = '';

  tabs: TaskTab[] = [];
  activeTab: TaskTab;

  taskProxyManager: TaskProxyManager;
  task?: Task;
  platform? : Platform;
  taskToken = '';
  gotTaskProxy = false;

  height?: number;
  heightInterval? : Subscription;

  lastAnswer = '';
  lastState = '';
  answerCheckInterval? : Subscription;
  answerSaveInterval? : Subscription;
  answerSaveSubscriberThrottled? : Subscriber<void>;
  answerSaveSubscriberForced? : Subscriber<void>;
  saving = false; // currently unused

  constructor(
    private sanitizer: DomSanitizer,
    private layoutService: LayoutService,
    private answerActionsService: AnswerActionsService,
    private taskTokensService: TaskTokensService,
    private currentContentService: CurrentContentService,
    private userSessionService: UserSessionService,
  ) {
    this.state = 'loading';
    this.setUrl('about:blank');
    this.height = 400;
    const initialTab = { name: 'Task' };
    this.tabs = [ initialTab ];
    //this.tabs.push({ name: 'Editor' });
    this.activeTab = initialTab;
    this.taskProxyManager = new TaskProxyManager();
  }

  // Lifecycle functions
  ngOnInit(): void {
    this.layoutService.toggleLeftMenuAndHeaders(false, true, true);
    this.layoutService.toggleWithTask(true);
    const url = this.itemData?.item.url || '';
    if (!this.itemData || !this.itemData.currentResult) {
      return;
    }
    this.taskTokensService.getTaskToken(this.itemData.item.id, this.itemData.currentResult.attemptId)
      .subscribe(token => {
        this.taskToken = token;
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
    this.layoutService.toggleWithTask(false);
  }


  // Iframe URL set
  taskIframeUrlSet(): void {
    if (!this.gotTaskProxy && this.iframe && this.urlSet) {
      const iframe = this.iframe.nativeElement;
      this.taskProxyManager.getTaskProxy(iframe, this.taskIframeLoaded.bind(this), false);
      this.gotTaskProxy = true;
    }
  }

  // Task iframe is ready
  taskIframeLoaded(task: Task): void {
    this.task = task;
    const taskParams = { minScore: 0, maxScore: 100, randomSeed: 0, noScore: 0, readOnly: false, options: {} };
    this.platform = new ItemDisplayPlatform(
      task,
      taskParams,
      this.taskToken,
      this.answerActionsService,
      this.forceSaveAnswerState.bind(this),
      this.updateScore.bind(this)
    );
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
    this.answerSaveInterval = merge(
      new Observable(subscriber => {
        this.answerSaveSubscriberThrottled = subscriber;
      })
        .pipe(throttleTime(60000, undefined, { leading: true, trailing: true }))
      ,
      new Observable(subscriber => {
        this.answerSaveSubscriberForced = subscriber;
      }))
      .pipe(switchMap(() => this.saveAnswerState()))
      .subscribe(() => {});

    this.task?.getMetaData(this.processTaskMetaData.bind(this));

    this.task?.getViews((views : any) => {
      this.task?.showViews({ task: true, editor: true }, () => {});
      this.setViews(views);
    });

    this.answerActionsService.listAnswers(this.itemData?.item.id||'', this.userSessionService.session$.value?.user.groupId||'')
      .pipe(switchMap(answerList => {
        const currentAnswer = answerList.find(answer => answer.type == 'Current');
        const answerId = currentAnswer?.id || answerList[0]?.id;
        return answerId ? this.answerActionsService.getAnswer(answerId) : of(null);
      }))
      .pipe(first())
      .subscribe(answerData => {
        this.reloadAnswerState(answerData?.answer || '', answerData?.state || '', () => {});
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
          this.answerSaveSubscriberThrottled?.next();
        }
      });
    });
  }

  reloadAnswerState(answer : string, state : string, callback : CompleteFunction): void {
    // Reloads an answer into the task
    this.task?.reloadState(answer, () => {
      this.task?.reloadAnswer(state, callback);
    });
  }

  saveAnswerState(): Observable<void> {
    // Saves the answer to the backend
    return this.answerActionsService.updateCurrent(
      this.itemData?.item.id || '',
      this.itemData?.currentResult?.attemptId || '',
      this.lastAnswer,
      this.lastState
    );
  }

  forceSaveAnswerState(): void {
    this.answerSaveSubscriberForced?.next();
  }

  updateScore(score: number): void {
    // Update the score in the UI
    if (this.itemData?.currentResult) {
      this.itemData.currentResult.score = score;
    }
    this.currentContentService.updateSameContent(content => {
      if (isItemInfo(content) && content.details !== undefined) {
        if (content.route.id !== this.itemData?.route.id || content.details.attemptId !== this.itemData?.currentResult?.attemptId) {
          // Abort update
          return null;
        }
        content.details.currentScore = score;
        content.details.bestScore = Math.max(content.details.bestScore || 0, score);
      }
      return content;
    });
  }

  updateHeight(): void {
    this.task?.getHeight(this.setHeight.bind(this));
  }

  processTaskMetaData(metadata : {[key: string] : any}): void {
    if (metadata.minWidth == 'auto') {
      this.classes = [ ...this.classes, 'full-width' ];
    } else if (typeof metadata.minWidth == 'number') {
      // TODO
    }
    if (metadata.autoHeight as boolean) {
      this.height = undefined;
      this.heightInterval?.unsubscribe();
      this.classes = [ ...this.classes, 'auto-height' ];
    }
  }

  // Views management
  setViews(_views : any) : void {
    // TODO
  }

  // Utility functions
  setHeight(height: number): void {
    if (this.classes.includes('auto-height')) {
      this.height = undefined;
      return;
    }
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
  constructor(
    task: Task,
    private taskParams: TaskParams,
    private taskToken: string,
    private answerActionsService: AnswerActionsService,
    private forceSaveAnswerState: () => void,
    private updateScore: (score: number) => void,
  ) {
    super(task);
  }

  log(_data : string | Array<any>, success : CompleteFunction, _error? : ErrorFunction) : void {
    success();
  }

  validate(mode : string, success : CompleteFunction, _error : ErrorFunction) : void {
    if (mode == 'cancel') {
      this.task.reloadAnswer('', () => {});
      success();
      return;
    }

    if (mode == 'nextImmediate') {
      // TODO mode == nextImmediate
      return;
    }

    this.forceSaveAnswerState();
    // Get the latest answer from the task
    this.task.getAnswer((answer: string) => {
      // Get the answer token
      this.answerActionsService.getAnswerToken(answer, this.taskToken)
        .pipe(
          // Grade the answer
          mergeMap(answerToken => new Observable<[string, number, string, string]>(subscriber => {
            this.task.gradeAnswer(answer, answerToken,
              (score, message, scoreToken) => subscriber.next([ answerToken, score, message, scoreToken ]));
          })),
          // Save result to backend
          mergeMap(([ answerToken, score, _message, scoreToken ]) => {
            this.updateScore(score);
            return this.answerActionsService.saveGrade(this.taskToken, score, answerToken, scoreToken);
          }),
          first()
        )
        .subscribe(success);
      // TODO mode == next
    });

  }

  getTaskParams(_key : string | undefined, _defaultValue : any, success : (result : any) => void, _? : ErrorFunction) : void {
    success(this.taskParams);
  }
}
