import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { CategoriesDto } from '../dtos/categories.dto';
import { ProductDto } from '../dtos/product.dto';
import { AllProductDto } from '../dtos/AllProduct.dto';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private readonly apiUrl : string = environment.apiUrl;
  private token !: string | null;

  constructor(
    private httpClient : HttpClient
  ) {
    if (typeof localStorage !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
   }

  getCategories(){
    return this.httpClient.get<CategoriesDto[]>(`${this.apiUrl}/categories`);
  }
  getCategoryById(id: number){
    return this.httpClient.get<CategoriesDto>(`${this.apiUrl}/categories/${id}`);
  }
  getAllProductByCategory(id: number){
    return this.httpClient.get<AllProductDto>(`${this.apiUrl}/products/category/${id}`);
  }
  postCategory(value: {name: string}){
    return this.httpClient.post(`${this.apiUrl}/categories`, value , {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`
      }),
      responseType: 'text'
    });
  }

  updateCategory(value: {name: string}, id: number){
    return this.httpClient.put(`${this.apiUrl}/categories/${id}`, value , {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`
      }),
      responseType: 'text'
    });
  }

  deleteCategory(id: number){
    return this.httpClient.delete(`${this.apiUrl}/categories/${id}` , {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`
      }),
      responseType: 'text'
    });
  }
}
