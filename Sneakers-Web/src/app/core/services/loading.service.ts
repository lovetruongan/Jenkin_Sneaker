import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  public loading: boolean = false;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  constructor() {
   }
   setLoading(value: boolean) {
    this.loadingSubject.next(value);
  }
}