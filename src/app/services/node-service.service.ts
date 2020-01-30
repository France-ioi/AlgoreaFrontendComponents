import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { TreeNode } from 'primeng/api';

@Injectable({
  providedIn: 'root'  // <- ADD THIS
})
export class NodeService {
  constructor(private http: HttpClient) {}

  getFiles() {
    return this.http
      .get<any>('assets/showcase/data/files.json')
      .toPromise()
      .then(res => res.data as TreeNode[]);
  }

  getTrees() {
    return this.http
      .get<any>('assets/showcase/data/trees.json')
      .toPromise()
      .then(res => res.data as TreeNode[]);
  }

  getFilesystem() {
    return this.http
      .get<any>('assets/showcase/data/filesystem.json')
      .toPromise()
      .then(res => res.data as TreeNode[]);
  }

  getCarHuge() {
    return this.http
      .get<any>('assets/showcase/data/cars-small.json');
  }
}
