import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
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
import { ProductUploadReq } from '../../../core/requestType/UploadProducts';


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
  private categoryId!: string;
  public categoriesOptions: MenuItem[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private categoriesService: CategoriesService,
    private productService: ProductService,
    private toastService : ToastService,
    private router: Router,
    private loadingService: LoadingService
  ) {
    super();
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      description: ['', Validators.required],
      price: [null, Validators.required],
      discount: [0, Validators.required],
      quantity: [null, Validators.required]
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

  onCategoryChange(event: any){
    this.categoryId = event.value;
  }

  uploadProduct(fileUpload: FileUpload){
    if (this.productForm.invalid) {
      this.toastService.fail("Vui lòng điền đầy đủ thông tin sản phẩm.");
      return;
    }
    if (!this.categoryId) {
      this.toastService.fail("Vui lòng chọn danh mục cho sản phẩm.");
      return;
    }
    if (fileUpload.files.length === 0) {
      this.toastService.fail("Vui lòng thêm ít nhất một ảnh cho sản phẩm.");
      return;
    }

    const productData: ProductUploadReq = {
      name: this.productForm.value.productName,
      price: this.productForm.value.price,
      description: this.productForm.value.description,
      discount: this.productForm.value.discount,
      category_id: parseInt(this.categoryId, 10),
      quantity: this.productForm.value.quantity,
    };

    this.productService.uploadProduct(productData).pipe(
      switchMap((response: {productId: number, message: string}) => {
        const formData = new FormData();
        fileUpload.files.forEach(file => {
          formData.append('files', file);
        });

        return this.productService.uploadImageProduct(formData, response.productId).pipe(
          tap(() => {
            this.toastService.success('Thêm sản phẩm thành công!');
            this.productForm.reset();
            fileUpload.clear();
            this.router.navigate(['/admin/products']);
          }),
          catchError((err) => {
            this.toastService.fail(`Tải ảnh lên thất bại: ${err.error?.message || 'Lỗi không xác định'}`);
            return of(err);
          })
        )
      }),
      catchError((err) => {
        this.toastService.fail(`Thêm sản phẩm thất bại: ${err.error?.message || 'Lỗi không xác định'}`);
        return of(err);
      })
    ).subscribe();
  }
}