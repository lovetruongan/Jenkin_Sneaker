import { HttpClient } from '@angular/common/http';
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

  constructor(
    private httpClient : HttpClient
  ) { }

  getCategories(){
    return this.httpClient.get<CategoriesDto[]>(`${this.apiUrl}categories`);
  }

  getAllProductByCategory(id: number){
    return this.httpClient.get<AllProductDto>(`${this.apiUrl}products/category/${id}`);
  }
}
