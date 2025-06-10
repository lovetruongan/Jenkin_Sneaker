import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { CategoriesService } from '../../../core/services/categories.service';
import { catchError, of, switchMap, tap } from 'rxjs';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { CategoriesDto } from '../../../core/dtos/categories.dto';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// PrimeNG imports
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { ToastService } from '../../../core/services/toast.service';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';

interface CategoryWithEditing extends CategoriesDto {
  editing?: boolean;
  originalName?: string;
}

@Component({
  selector: 'app-category-manage',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TableModule,
    CardModule,
    TooltipModule
  ],
  providers: [
    MessageService,
    ToastService,
    ConfirmationService
  ],
  templateUrl: './category-manage.component.html',
  styleUrl: './category-manage.component.scss'
})
export class CategoryManageComponent extends BaseComponent implements OnInit {
  public categoriesOptions: CategoryWithEditing[] = [];
  public visible: boolean = false;
  public categoryName: string = "";
  public loading: boolean = false;
  public totalRecords: number = 0;
  public showSearchDialog: boolean = false;
  public searchTerm: string = '';

  get filteredCategories(): CategoryWithEditing[] {
    if (!this.categoriesOptions) return [];
    
    let filtered = [...this.categoriesOptions];
    
    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(category => 
        category.name?.toLowerCase().includes(searchLower)
      );
    }
    
    this.totalRecords = filtered.length;
    return filtered;
  }

  constructor(
    private categoriesService: CategoriesService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.loading = true;
    this.categoriesService.getCategories().pipe(
      tap((categories) => {
        this.categoriesOptions = categories.map(cat => ({
          ...cat,
          editing: false
        }));
        this.loading = false;
      }),
      catchError(err => {
        this.loading = false;
        this.toastService.fail('Không thể tải danh sách danh mục');
        return of([]);
      })
    ).subscribe();
  }

  // Search and filter methods
  resetSearch(): void {
    this.searchTerm = '';
  }

  // Dialog methods
  openAddDialog(): void {
    this.visible = true;
    this.categoryName = '';
  }

  closeAddDialog(): void {
    this.visible = false;
    this.categoryName = '';
  }

  // Inline editing methods
  editCategory(rowIndex: number): void {
    // Cancel any other editing rows
    this.categoriesOptions.forEach((cat, index) => {
      if (index !== rowIndex) {
        cat.editing = false;
      }
    });
    
    const category = this.categoriesOptions[rowIndex];
    category.editing = true;
    category.originalName = category.name;
  }

  saveCategory(category: CategoryWithEditing, rowIndex: number): void {
    if (!category.name || category.name.trim() === '') {
      this.toastService.fail('Tên danh mục không được để trống');
      return;
    }

    // Check if name already exists (excluding current category)
    const existingCategory = this.categoriesOptions.find(cat => 
      cat.id !== category.id && cat.name.toLowerCase() === category.name.toLowerCase()
    );

    if (existingCategory) {
      this.toastService.fail('Danh mục đã tồn tại');
      return;
    }

    this.categoriesService.updateCategory({name: category.name.trim()}, category.id).pipe(
      tap((res: string) => {
        // Find the category in the array and update its name
        const updatedCategory = this.categoriesOptions.find(cat => cat.id === category.id);
        if (updatedCategory) {
          updatedCategory.name = category.name.trim();
          updatedCategory.editing = false;
        }
        this.toastService.success(res || 'Cập nhật thành công');
      }),
      catchError((err) => {
        this.toastService.fail(err.error?.message || err.error || 'Cập nhật thất bại');
        // Restore original name
        category.name = category.originalName || category.name;
        category.editing = false;
        return of(err);
      })
    ).subscribe();
  }

  cancelEdit(rowIndex: number): void {
    const category = this.categoriesOptions[rowIndex];
    category.editing = false;
    category.name = category.originalName || category.name;
  }

  addCategory(): void {
    if (!this.categoryName || this.categoryName.trim() === '') {
      this.toastService.fail('Tên danh mục không được để trống');
      return;
    }

    // Check if name already exists
    const existingCategory = this.categoriesOptions.find(cat => 
      cat.name.toLowerCase() === this.categoryName.toLowerCase()
    );

    if (existingCategory) {
      this.toastService.fail('Danh mục đã tồn tại');
      return;
    }

    this.categoriesService.postCategory({name: this.categoryName.trim()}).pipe(
      tap((res: string) => {
        // After successfully adding, reload all categories to get the new one with its ID
        this.loadCategories();
        this.toastService.success(res || 'Thêm danh mục thành công');
        this.closeAddDialog();
      }),
      catchError((err) => {
        this.toastService.fail(err.error?.message || err.error || 'Thêm danh mục thất bại');
        return of(err);
      })
    ).subscribe();
  }
  
  confirmDelete(id: number): void {
    this.confirmationService.confirm({
      message: 'Bạn chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác.',
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: "none",
      rejectIcon: "none",
      rejectButtonStyleClass: "p-button-text",
      accept: () => {
        this.categoriesService.deleteCategory(id).pipe(
          tap((res: string) => {
            // On success, remove the category from the local array
            this.categoriesOptions = this.categoriesOptions.filter(cat => cat.id !== id);
            this.toastService.success(res || 'Xóa danh mục thành công');
          }),
          catchError((err) => {
            this.toastService.fail(err.error?.message || err.error || err || 'Xóa danh mục thất bại');
            return of(err);
          })
        ).subscribe();
      }
    });
  }

  updateCategory(id: number, name: string): void {
    let categoryExist = this.categoriesOptions.find(res => res.name === name);

    if (categoryExist) {
      this.toastService.fail("Danh mục đã tồn tại");
      return;
    }
    this.categoriesService.updateCategory({name: name}, id).pipe(
      tap((res: string) => {
        this.loadCategories();
        this.toastService.success(res || "Cập nhật thành công");
      }),
      catchError((err) => {
        this.toastService.fail(err.error?.message || err.error || 'Cập nhật thất bại');
        return of(err);
      })
    ).subscribe();
  }
}
