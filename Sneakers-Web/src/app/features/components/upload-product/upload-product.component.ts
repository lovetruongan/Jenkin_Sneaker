import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { MenuItem, MessageService } from 'primeng/api';
import { CategoriesService } from '../../../core/services/categories.service';
import { catchError, of, switchMap, tap } from 'rxjs';
import { CategoriesDto } from '../../../core/dtos/categories.dto';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { ToastModule } from 'primeng/toast';
import { LoadingService } from '../../../core/services/loading.service';


@Component({
  selector: 'app-upload-product',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    InputTextareaModule,
    FileUploadModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CardModule,
    ToastModule
  ],
  providers: [
    MessageService,
    ToastService,
  ],
  templateUrl: './upload-product.component.html',
  styleUrl: './upload-product.component.scss'
})
export class UploadProductComponent extends BaseComponent implements OnInit {
  public productForm: FormGroup;
  public myFiles: File[] = [];
  private categoryId!: string;
  public categoriesOptions: MenuItem[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private categoriesService: CategoriesService,
    private productService: ProductService,
    private readonly messageService: MessageService,
    private toastService : ToastService,
    private loadingService: LoadingService
  ) {
    super();
    this.productForm = this.fb.group({
      productName: [, Validators.required],
      description: [, Validators.required],
      price:[, Validators.required],
      discount:[, Validators.required],
      quantity:[, Validators.required]
    })
  }
  ngOnInit(): void {
    this.categoriesService.getCategories().pipe(
      tap((categories) => {
        this.categoriesOptions = categories.map((item: CategoriesDto) => {
          return {
            label: item.name,
            value: item.id.toString()
          }
        })
      })
    ).subscribe()
  }

  onFileSelect(event: any){
    this.myFiles = Array.from(event.files);
  }

  onCategoryChange(event: any){
    this.categoryId = event.value;
  }

  uploadProduct(){
    const formData = new FormData();
    this.myFiles.forEach(file => {
      formData.append('files', file, file.name);
    });
    
    if (this.productForm.valid && this.myFiles.length > 0 && this.categoryId){
      this.productService.uploadProduct({
        name: this.productForm.value.productName,
        price: this.productForm.value.price,
        description: this.productForm.value.description,
        discount: this.productForm.value.discount,
        category_id: parseInt(this.categoryId),
        quantity: this.productForm.value.quantity,
      }).pipe(
        switchMap((res: {productId: number, message: string}) => {
          return this.productService.uploadImageProduct(formData, res.productId).pipe(
            tap((res : {message: string}) => {
              this.toastService.success(res.message);
              this.productForm.reset();
              this.myFiles = [];
            }),
            catchError((err) => {
              this.toastService.fail(err.error.message);
              return of(err);
            })
          )
        }),
        catchError((err) => {
          this.toastService.fail(err.error.message);
          return of(err);
        })
      ).subscribe();
    } else {
      this.toastService.fail("Vui lòng điền đầy đủ thông tin và ảnh")
    }
  }
}