import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { ProductDto } from '../dtos/product.dto';
import { AllProductDto } from '../dtos/AllProduct.dto';
import { ProductToCartDto } from '../dtos/productToCart.dto';
import { ProductFromCartDto } from '../dtos/ProductFromCart.dto';
import { Observable } from 'rxjs';
import { ProductUploadReq } from '../requestType/UploadProducts';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl: string = environment.apiUrl;

  constructor(
    private httpClient: HttpClient
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  private getFileUploadHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getAllProduct() {
    return this.httpClient.get<AllProductDto>(`${this.apiUrl}/products/all`);
  }

  getProductById(id: string) {
    return this.httpClient.get<ProductDto>(`${this.apiUrl}/products/${id}`);
  }

  getProductViaPrice(minPrice: number, maxPrice: number) {
    return this.httpClient.get<AllProductDto>(`${this.apiUrl}/products/price?min_price=${minPrice}&max_price=${maxPrice}`);
  }

  addProductToCart(product: ProductToCartDto) {
    return this.httpClient.post(`${this.apiUrl}/carts`, product, {
      headers: this.getAuthHeaders()
    });
  }

  removeProductFromCart(id: number){
    return this.httpClient.post(`${this.apiUrl}/carts/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  searchProduct(content: string){
    return this.httpClient.get<AllProductDto>(`${this.apiUrl}/products/search?keyword=${content}`);
  }

  getProductFromCart(){
    return this.httpClient.get<ProductFromCartDto>(`${this.apiUrl}/carts`, {
      headers: this.getAuthHeaders()
    });
  }

  updateProductFromCart(idCart: number, product: ProductToCartDto){
    return this.httpClient.put(`${this.apiUrl}/carts/${idCart}`, product, {
      headers: this.getAuthHeaders()
    });
  }

  deleteProductFromCart(id: number){
    return this.httpClient.delete(`${this.apiUrl}/carts/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  deleteAllProductsFromCart(){
    return this.httpClient.delete(`${this.apiUrl}/carts`, {
      headers: this.getAuthHeaders()
    });
  }

  getRelatedProduct(id: string){
    return this.httpClient.get<AllProductDto>(`${this.apiUrl}/products/related/${id}`)
  }
  
  deleteProduct(id: string){
    return this.httpClient.delete(`${this.apiUrl}/products/${id}`, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    })
  }

  uploadProduct(product: ProductUploadReq){
    return this.httpClient.post<{productId: number, message: string}>(`${this.apiUrl}/products`, product, {
      headers: this.getAuthHeaders()
    })
  }

  uploadImageProduct(files : FormData,id: number){
    return this.httpClient.post<{message: string}>(`${this.apiUrl}/products/uploads/${id}`, files, {
      headers: this.getFileUploadHeaders()
    })
  }
  
  updateProduct(product: ProductUploadReq, id: number){
    return this.httpClient.put<{message: string}>(`${this.apiUrl}/products/${id}`, product, {
      headers: this.getAuthHeaders()
    })
  }
}
