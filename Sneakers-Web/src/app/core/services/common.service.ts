import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ProductsInCartDto } from '../dtos/productsInCart.dto';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  public intermediateObservable = new Subject<boolean>();
  public orderId = new BehaviorSubject<number>(0);
  constructor() { }

}
