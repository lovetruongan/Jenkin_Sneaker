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
    DropdownModule
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
  public images : {id : number,imageUrl : string}[] = [];
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
      discount: [, Validators.required]
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
            discount: product.discount
          })
          this.categoryId = product.category_id.toString();
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
          this.relatedProducts = product.products;
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

  onUpload(event: any){
  this.loadingService.setLoading(true);

  setTimeout(() => {
    this.myFiles = event.files;
    setTimeout(() => {
      this.loadingService.setLoading(false);
    }, 0);
  }, 2000);
  }

  onCategoryChange(event: any){
    this.categoryId = event.value;
  }

  confirmDelete() {
    this.confirmationService.confirm({
        message: 'Bạn chắc chắn muốn bỏ sản phẩm này?',
        header: 'Xác nhận',
        icon: 'pi pi-exclamation-triangle',
        acceptIcon:"none",
        rejectIcon:"none",
        rejectButtonStyleClass:"p-button-text",
        accept: () => {
          this.productService.deleteProduct(this.id).pipe(
            switchMap(() => {
              return this.productService.deleteProduct(this.id).pipe(
                tap((res: any) => {
                  this.router.navigate(["/allProduct"]);
                }),
                catchError((err) => of(err))
              )
            }),
            takeUntil(this.destroyed$),
            catchError((err) => {
              return of(err);
            })
          ).subscribe();
        },
        reject: () => {
        }
    });
  }

  updateProductAdmin(){
    const formData = new FormData();
    this.myFiles.forEach(file => {
      formData.append('files', file, file.name);
    });

    if (this.productForm.valid && this.myFiles.length > 0 && this.categoryId){
      this.productService.uploadImageProduct(formData, parseInt(this.id)).pipe(
        switchMap(() => {
          return this.productService.updateProduct({
            name: this.productForm.value.productName,
            price: this.productForm.value.price,
            description: this.productForm.value.description,
            discount: this.productForm.value.discount,
            category_id: parseInt(this.categoryId)
          }, parseInt(this.id)).pipe(
            tap((res: {message: string}) => {
              this.toastService.success(res.message);
              this.router.navigate(['/allProduct']);
            }),
            catchError((err) => {
              this.toastService.fail(err.error.message);
              return of(err);
            })
          );
        }),
        catchError((err) => {
          this.toastService.fail(err.error.message);
          return of(err);
        })
      ).subscribe();
    } else if (this.productForm.valid && this.myFiles.length == 0 && this.categoryId) {
      this.productService.updateProduct({
        name: this.productForm.value.productName,
        price: this.productForm.value.price,
        description: this.productForm.value.description,
        discount: this.productForm.value.discount,
        category_id: parseInt(this.categoryId)
      }, parseInt(this.id)).pipe(
        tap((res: {message: string}) => {
          this.toastService.success(res.message);
          setTimeout(() => {
            this.router.navigate(['/allProduct']);
          }, 1000)
        }),
        catchError((err) => {
          this.toastService.fail(err.error.message);
          return of(err);
        })
      ).subscribe();
    } else {
      this.toastService.fail("Vui lòng nhập đầy đủ thông tin muốn cập nhật");
    }

  }
}
