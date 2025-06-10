import { AfterViewInit, Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { ProductService } from '../../../core/services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, filter, finalize, of, switchMap, take, takeUntil, tap } from 'rxjs';
import { ProductDto } from '../../../core/dtos/product.dto';
import { GalleriaModule } from 'primeng/galleria';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ToastService } from '../../../core/services/toast.service';
import { DetailProductService } from '../../../core/services/detail-product.service';
import { CommonService } from '../../../core/services/common.service';
import { environment } from '../../../../environments/environment.development';
import { AllProductDto } from '../../../core/dtos/AllProduct.dto';
import { UserDto } from '../../../core/dtos/user.dto';
import { UserService } from '../../../core/services/user.service';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { LoadingService } from '../../../core/services/loading.service';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { CategoriesService } from '../../../core/services/categories.service';
import { CategoriesDto } from '../../../core/dtos/categories.dto';


@Component({
  selector: 'app-detail-product',
  standalone: true,
  imports: [
    GalleriaModule,
    InputNumberModule,
    FormsModule,
    CurrencyPipe,
    ToastModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextareaModule,
    FileUploadModule,
    ButtonModule,
    ConfirmDialogModule,
    DropdownModule,
    CardModule
  ],
  providers: [
    MessageService,
    ToastService,
    ConfirmationService
  ],
  templateUrl: './detail-product.component.html',
  styleUrl: './detail-product.component.scss'
})
export class DetailProductComponent extends BaseComponent implements OnInit,AfterViewInit {
  public productForm: FormGroup;
  public roleId: number = 100;
  private token: string | null = null;
  private id !: string ;
  public mainProduct !: ProductDto;
  public responsiveOptions : any[] = [];
  public images : {id : number, image_url : string}[] = [];
  public relatedProducts: ProductDto[] = [];
  public quantity : number = 1;
  public sizes : number[] = [36,37,38,39,40,41,42,43,44];
  public size : number = this.sizes[0];
  public apiImage: string = environment.apiImage;
  public myFiles: File[] = [];
  public categoriesOptions: MenuItem[] = [];
  private categoryId!: string;
  public categoryNameOfProduct!: string;

  constructor(
    private readonly fb: FormBuilder,
    private productService : ProductService,
    private activatedRoute : ActivatedRoute,
    private router: Router,
    private readonly messageService: MessageService,
    private toastService : ToastService,
    private detailProductService: DetailProductService,
    private commonService: CommonService,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private loadingService: LoadingService,
    private categoriesService: CategoriesService
  ) {
    super();
    if (typeof localStorage != 'undefined'){
      this.token = localStorage.getItem("token");
      this.roleId = parseInt(JSON.parse(localStorage.getItem("userInfor") || '{"role_id": "0"}').role_id || '0');
    }
    this.productForm = this.fb.group({
      productName: [, Validators.required],
      description: [, Validators.required],
      price:[, Validators.required],
      discount: [, Validators.required],
      quantity: [, Validators.required]
    })
  }
  ngAfterViewInit(): void {
    
  }

  ngOnInit(): void {
    if (this.token != null){
      this.userService.getInforUser(this.token).pipe(
        filter((userInfo: UserDto) => !!userInfo),
        tap((userInfo: UserDto) => {
          this.roleId = userInfo.role.id;
        }),
        takeUntil(this.destroyed$),
        catchError((err) => of(err))
      ).subscribe()
    }

    this.responsiveOptions = [
      {
        breakpoint: '1024px',
        numVisible: 5
    },
    {
        breakpoint: '768px',
        numVisible: 3
    },
    {
        breakpoint: '560px',
        numVisible: 1
    }
    ]

    this.id = this.activatedRoute.snapshot.paramMap.get('id') ?? '1';
    if (this.id != ":id"){
      this.productService.getProductById(this.id).pipe(
        filter((product : ProductDto) => !!product),
        tap((product : ProductDto) => {
          this.loadingService.loading = true;
          this.mainProduct = product;
          this.productForm.setValue({
            productName: product.name,
            description: product.description,
            price: product.price,
            discount: product.discount,
            quantity: product.quantity
          })
          this.categoryId = product.category_id?.toString() ?? '';
          this.images = product.product_images;
        }),
        switchMap(() => {
          return this.categoriesService.getCategoryById(parseInt(this.categoryId)).pipe(
            tap((category: CategoriesDto) => {
              this.categoryNameOfProduct = category.name;
            }),
            catchError((err) => {
              return of(err);
            })
          );
        }),
        catchError((err) => {
          return of(err);
        }),
        finalize(() => {
          this.loadingService.loading = false;
        })
      ).subscribe();

      this.productService.getRelatedProduct(this.id).pipe(
        filter((product : AllProductDto) => !!product),
        tap((product : AllProductDto) => {
          this.relatedProducts = product.products.filter(p => p.quantity > 0);
        }),
      ).subscribe();
    }

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

  addToCart(){
    this.productService.addProductToCart({
      product_id: Number(this.id),
      quantity: this.quantity,
      size:  this.size
    }).pipe(
      tap(() => {
        this.toastService.success("Thêm sản phẩm vào giỏ hàng thành công");
        this.detailProductService.setQuantity();
        this.commonService.intermediateObservable.next(true);
      }),
      catchError((error) => {
        this.toastService.fail("Thêm sản phẩm vào giỏ hàng thất bại");
        return of();
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  goToDetail(id: number){
    window.location.href = `/detailProduct/${id}`;
  }

  onFileSelect(event: any){
    this.myFiles = Array.from(event.files);
  }

  onCategoryChange(event: any){
    this.categoryId = event.value;
  }

  confirmDelete() {
    this.confirmationService.confirm({
        message: `Bạn có chắc chắn muốn xóa sản phẩm "${this.mainProduct?.name || 'này'}"? Hành động này không thể hoàn tác!`,
        header: 'Xác nhận xóa sản phẩm',
        icon: 'pi pi-exclamation-triangle',
        acceptIcon: "none",
        rejectIcon: "none",
        rejectButtonStyleClass: "p-button-text",
        acceptButtonStyleClass: "p-button-danger",
        accept: () => {
          this.loadingService.setLoading(true);
          
          this.productService.deleteProduct(this.id).pipe(
            tap((res: any) => {
              // Backend returns a simple string message, so any response means success
              console.log('Delete response:', res);
              this.loadingService.setLoading(false);
              this.toastService.success('Xóa sản phẩm thành công!');
              
              // Navigate to products list
              this.router.navigate(["/allProduct"]);
            }),
            catchError((err) => {
              console.error('Delete error:', err);
              this.loadingService.setLoading(false);
              if (err.status === 200 || err.status === 0) {
                // Sometimes Angular treats successful string responses as errors
                this.toastService.success('Xóa sản phẩm thành công!');
                
                // Navigate to products list
                this.router.navigate(["/allProduct"]);
              } else {
                this.toastService.fail(`Xóa sản phẩm thất bại: ${err.error?.message || err.message || 'Lỗi không xác định'}`);
              }
              return of(null);
            }),
            finalize(() => {
              this.loadingService.setLoading(false);
            }),
            takeUntil(this.destroyed$)
          ).subscribe();
        }
    });
  }

  goBack(){
    // Navigate back to all products
    this.router.navigate(["/allProduct"]);
  }

  trackByImageId(index: number, image: any): number {
    return image.id;
  }

  getFilePreview(file: File): string {
    return URL.createObjectURL(file);
  }

  removeFile(index: number): void {
    this.myFiles.splice(index, 1);
  }

  deleteImage(imageId: number): void {
    // Implement delete image functionality
    this.confirmationService.confirm({
      message: 'Bạn có chắc chắn muốn xóa ảnh này?',
      header: 'Xác nhận xóa ảnh',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: "none",
      rejectIcon: "none",
      rejectButtonStyleClass: "p-button-text",
      accept: () => {
        // Call API to delete image
        // After successful deletion, update the images array
        this.images = this.images.filter(img => img.id !== imageId);
        this.toastService.success('Xóa ảnh thành công');
      },
      reject: () => {
        // User cancelled
      }
    });
  }

  updateProductAdmin(){
    const formData = new FormData();
    this.myFiles.forEach(file => {
      formData.append('files', file, file.name);
    });
    
    if (this.productForm.valid){
      this.productService.updateProduct({
        name: this.productForm.value.productName,
        price: this.productForm.value.price,
        description: this.productForm.value.description,
        discount: this.productForm.value.discount,
        category_id: parseInt(this.categoryId),
        quantity: this.productForm.value.quantity
      }, parseInt(this.id)).pipe(
        switchMap(() => {
          if (this.myFiles.length > 0) {
            return this.productService.uploadImageProduct(formData, parseInt(this.id)).pipe(
              tap((res : {message: string}) => {
                this.toastService.success(res.message);
                this.myFiles = [];
                // Reload product data to show updated images
                this.ngOnInit();
              }),
              catchError((err) => {
                this.toastService.fail(err.error.message);
                return of(err);
              })
            )
          } else {
            this.toastService.success("Cập nhật sản phẩm thành công");
            return of(null);
          }
        }),
        catchError((err) => {
          this.toastService.fail(err.error.message);
          return of(err);
        })
      ).subscribe()
    } else {
      this.toastService.fail("Vui lòng điền đầy đủ thông tin")
    }
  }
}
