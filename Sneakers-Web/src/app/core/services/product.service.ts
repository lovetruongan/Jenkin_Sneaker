import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { ProductDto } from '../dtos/product.dto';
import { AllProductDto } from '../dtos/AllProduct.dto';
import { ProductToCartDto } from '../dtos/productToCart.dto';
import { ProductFromCartDto } from '../dtos/ProductFromCart.dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl: string = environment.apiUrl;
  private token !: string | null;

  constructor(
    private httpClient: HttpClient
  ) {
    if (typeof localStorage !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  getAllProduct() {
    return this.httpClient.get<AllProductDto>(`${this.apiUrl}products/all`);
  }

  getProductById(id: string) {
    return this.httpClient.get<ProductDto>(`${this.apiUrl}products/${id}`);
  }

  getProductViaPrice(minPrice: number, maxPrice: number) {
    return this.httpClient.get<AllProductDto>(`${this.apiUrl}products/price?min_price=${minPrice}&max_price=${maxPrice}`);
  }

  addProductToCart(product: ProductToCartDto) {
    return this.httpClient.post(`${this.apiUrl}carts`, product, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`
      })
    });
  }

  removeProductFromCart(id: number){
    return this.httpClient.post(`${this.apiUrl}carts/${id}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`
      })
    });
  }

  searchProduct(content: string){
    return this.httpClient.get<AllProductDto>(`${this.apiUrl}products/search?keyword=${content}`);
  }

  getProductFromCart(){
    return this.httpClient.get<ProductFromCartDto>(`${this.apiUrl}carts`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`
      })
    });
  }

  updateProductFromCart(idCart: number, product: ProductToCartDto){
    return this.httpClient.put(`${this.apiUrl}carts/${idCart}`, product, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`
      })
    });
  }

  deleteProductFromCart(id: number){
    return this.httpClient.delete(`${this.apiUrl}carts/${id}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`
      })
    });
  }

  getRelatedProduct(id: string){
    return this.httpClient.get<AllProductDto>(`${this.apiUrl}products/related/${id}`)
  }
}
