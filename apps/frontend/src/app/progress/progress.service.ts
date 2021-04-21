import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Progress } from '@face-recognition-editor/data';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {

  progressSubject: Subject<Progress>;

  constructor(private http: HttpClient) { 
    this.progressSubject = new Subject();

    setInterval(() => {
      this._getProgress(); 
      }, 5000);

  }

  getSortObservable(): Observable<Progress> {
    return this.progressSubject.asObservable()
  }

  private _getProgress() {
      this.http.get<Progress>('/api/person/progress').subscribe((p) => {
        p.lastStartTime = new Date(p.lastStartTime);
        
        this.progressSubject.next(p);
      })
  } 

}
