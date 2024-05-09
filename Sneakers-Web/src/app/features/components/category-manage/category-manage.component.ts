import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { CategoriesService } from '../../../core/services/categories.service';
import { catchError, of, switchMap, tap } from 'rxjs';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { CategoriesDto } from '../../../core/dtos/categories.dto';
import {FormsModule} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { ToastService } from '../../../core/services/toast.service';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-category-manage',
  standalone: true,
  imports: [
    FormsModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [
    MessageService,
    ToastService,
    ConfirmationService
  ],
  templateUrl: './category-manage.component.html',
  styleUrl: './category-manage.component.scss'
})
export class CategoryManageComponent extends BaseComponent implements OnInit{
  public categoriesOptions: CategoriesDto[] = [];
  public visible: boolean = false;
  public categoryName: string = "";

  constructor(
    private categoriesService: CategoriesService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.categoriesService.getCategories().pipe(
      tap((categories) => {
        this.categoriesOptions = categories;
      })
    ).subscribe()
    
  }

  addCategory(){
    if (this.categoryName !== ""){
      this.categoriesService.postCategory({name: this.categoryName}).pipe(
        tap((res: {categories: CategoriesDto[],message: string}) => {
          this.categoriesOptions = res.categories;
          this.toastService.success(res.message);
          this.visible = false;
          this.categoryName = "";
        }),
        catchError((err) => {
          this.toastService.fail(err.error.message);
          return of(err);
        })
      ).subscribe();
    }
  }
  
  confirmDelete(id: number) {
    this.confirmationService.confirm({
        message: 'Bạn chắc chắn muốn bỏ danh mục này?',
        header: 'Xác nhận',
        icon: 'pi pi-exclamation-triangle',
        acceptIcon:"none",
        rejectIcon:"none",
        rejectButtonStyleClass:"p-button-text",
        accept: () => {
          this.categoriesService.deleteCategory(id).pipe(
            tap((res: {categories: CategoriesDto[],message: string}) => {
              this.categoriesOptions = res.categories;
              this.toastService.success(res.message);
            }),
            catchError((err) => {
              return of(err);
            })
          ).subscribe();
        },
        reject: () => {
        }
    });
  }

  updateCategory(id: number, name: string){
    let categoryExist = this.categoriesOptions.find(res => res.name === name);

    if (categoryExist){
      this.toastService.fail("Danh mục đã tồn tại");
      return;
    }
    this.categoriesService.updateCategory({name: name}, id).pipe(
      tap((res: {categories: CategoriesDto[],message: string}) => {
        this.categoriesOptions = res.categories;
        this.toastService.success(res.message);
      }),
      catchError((err) => {
        return of(err);
      })
    ).subscribe();
  }
}
