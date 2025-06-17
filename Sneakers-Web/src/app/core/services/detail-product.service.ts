import { Injectable } from '@angular/core';
import { Subject, filter, takeUntil, tap } from 'rxjs';
import { ProductService } from './product.service';
import { BaseComponent } from '../commonComponent/base.component';
import { ProductFromCartDto } from '../dtos/ProductFromCart.dto';

@Injectable({
  providedIn: 'root'
})
export class DetailProductService extends BaseComponent {
  public id !: number;
  public content = new Subject<string>();
  public quantityProductsInCart = new Subject<number>();
  constructor(
    private productService: ProductService
  ) {
    super();
  }

  setId(newId : number){
    this.id = newId;
  }

  setContent(newContent : string){
    this.content.next(newContent);
  }

  setQuantity(){
    this.productService.getProductFromCart().pipe(
      filter((product : ProductFromCartDto) => !!product),
      tap((product : ProductFromCartDto) => {
        this.quantityProductsInCart.next(product.totalCartItems); 
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }
}
