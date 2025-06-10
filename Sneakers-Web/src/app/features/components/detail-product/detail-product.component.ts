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
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { LoadingService } from '../../../core/services/loading.service';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { CategoriesService } from '../../../core/services/categories.service';
import { CategoriesDto } from '../../../core/dtos/categories.dto';
import { RouterModule } from '@angular/router';
import { TabViewModule } from 'primeng/tabview';
import { ProductUploadReq } from '../../../core/requestType/UploadProducts';


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
    CardModule,
    RouterModule,
    TabViewModule
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

  buyNow() {
    if (!this.token) {
      this.toastService.fail('Bạn phải đăng nhập để thực hiện chức năng này!');
      this.router.navigate(['/login']);
      return;
    }

    // Create temporary cart item data for immediate checkout
    const cartItems = [{
      id: Math.random(), // temporary id
      quantity: this.quantity,
      size: this.size,
      products: this.mainProduct
    }];

    // Store in localStorage and navigate to order page
    localStorage.setItem("productOrder", JSON.stringify(cartItems));
    this.router.navigate(['/order']);
  }

  goToDetail(id: number){
    window.location.href = `/detailProduct/${id}`;
  }

  onCategoryChange(event: any) {
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
            this.deleteProduct();
        },
    });
  }

  deleteProduct(){
    this.productService.deleteProduct(this.mainProduct.id.toString()).pipe(
      tap(() => {
        this.toastService.success("Xóa sản phẩm thành công");
        this.router.navigate(["/all-product"]);
      }),
      catchError((err) => {
        // Attempt to parse the error response
        let errorMessage = "Xóa sản phẩm thất bại. Có thể sản phẩm này đã được đặt hàng.";
        if (err && err.error) {
          try {
            // If the error response is JSON with a 'message' property
            const errorResponse = JSON.parse(err.error);
            if (errorResponse.message) {
              errorMessage = errorResponse.message;
            }
          } catch (e) {
            // If the error response is just a string
            if (typeof err.error === 'string') {
              errorMessage = err.error;
            }
          }
        }
        this.toastService.fail(errorMessage);
        return of(err);
      })
    ).subscribe()
  }

  goBack(){
    this.router.navigate(["/"]);
  }

  trackByImageId(index: number, image: any): number {
    return image.id;
  }

  deleteImage(imageId: number): void {
    this.confirmationService.confirm({
      message: 'Bạn có chắc chắn muốn xóa ảnh này? Chức năng này chỉ xóa ảnh khỏi giao diện, bạn cần Cập nhật sản phẩm để lưu thay đổi.',
      header: 'Xác nhận xóa ảnh',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Since there is no dedicated backend endpoint, we just remove it from the view.
        this.images = this.images.filter(img => img.id !== imageId);
        this.toastService.success('Đã xóa ảnh khỏi danh sách. Nhấn "Cập nhật sản phẩm" để lưu thay đổi.');
      }
    });
  }

  updateProductAdmin(fileUpload: FileUpload) {
    if (this.productForm.invalid) {
      this.toastService.fail("Vui lòng điền đầy đủ thông tin sản phẩm.");
      return;
    }

    const updatedProductData: ProductUploadReq = {
      name: this.productForm.value.productName,
      price: this.productForm.value.price,
      description: this.productForm.value.description,
      category_id: parseInt(this.categoryId, 10),
      discount: this.productForm.value.discount,
      quantity: this.productForm.value.quantity,
    };

    this.productService.updateProduct(updatedProductData, this.mainProduct.id).pipe(
      tap(() => {
        if (fileUpload.files.length > 0) {
          const formData = new FormData();
          fileUpload.files.forEach(file => {
            formData.append('files', file);
          });
          
          this.productService.uploadImageProduct(formData, this.mainProduct.id).pipe(
            tap(() => {
              this.toastService.success('Cập nhật sản phẩm và tải lên ảnh thành công!');
              fileUpload.clear();
              this.ngOnInit(); // Refresh component data
            }),
            catchError((err) => {
              this.toastService.fail(`Tải lên ảnh thất bại: ${err.error?.message || 'Lỗi không xác định'}`);
              return of(err);
            })
          ).subscribe();
        } else {
          this.toastService.success('Cập nhật sản phẩm thành công!');
          this.ngOnInit(); // Refresh component data
        }
      }),
      catchError((err) => {
        const errorMessage = err.error?.message || 'Cập nhật sản phẩm thất bại. Vui lòng thử lại.';
        this.toastService.fail(errorMessage);
        return of(err);
      })
    ).subscribe();
  }
}
