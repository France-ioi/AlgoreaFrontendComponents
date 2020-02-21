import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EditService {

  status = new BehaviorSubject<any>({
    scrolled: false,
    folded: false,
    isStarted: false,
    collapsed: false,
    editing: false,
    activityORSkill: false
  });

  user = new BehaviorSubject<any>({});

  url = new BehaviorSubject<string>('');

  constructor() { }

  setValue(val) {
    this.status.next(val);
  }

  getOb() {
    return this.status.asObservable();
  }

  setUser(val) {
    this.user.next(val);
  }

  getUserOb() {
    return this.user.asObservable();
  }

  setUrl(val) {
    this.url.next(val);
  }

  getUrl() {
    return this.url.getValue();
  }
}
