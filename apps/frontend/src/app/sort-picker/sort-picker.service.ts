import { Injectable } from '@angular/core';
import { Observable, PartialObserver } from 'rxjs';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SortPickerService {

  sortSubject: Subject<Sort>;

  constructor() { 
    this.sortSubject = new Subject();
    this.sortSubject.next(Sort.byName);
  }

  getSortObservable(): Observable<Sort> {
    return this.sortSubject.asObservable()
  }
  
  setSort(sort: Sort) {
    this.sortSubject.next(sort);
  }



}
export enum Sort
    {
        byName,
        byCreationDate,
        byCreationDateReverse,
        byModificationDate,
        byModificationDateReverse,
        byActionNeeded
    }