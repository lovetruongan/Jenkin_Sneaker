import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { VoucherService } from '../../../core/services/voucher.service';
import { VoucherDto } from '../../../core/dtos/voucher.dto';
import { catchError, of, tap } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ToastService } from '../../../core/services/toast.service';
import { DropdownModule } from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

@Component({
  selector: 'app-voucher-manage',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    InputTextareaModule,
    ButtonModule,
    DialogModule,
    TableModule,
    ToastModule,
    ConfirmDialogModule,
    CalendarModule,
    CheckboxModule,
    TagModule,
    TooltipModule,
    DropdownModule,
    InputGroupModule,
    InputGroupAddonModule
  ],
  providers: [
    MessageService,
    ToastService,
    ConfirmationService
  ],
  templateUrl: './voucher-manage.component.html',
  styleUrl: './voucher-manage.component.scss'
})
export class VoucherManageComponent extends BaseComponent implements OnInit {
  public vouchers: VoucherDto[] = [];
  public visible: boolean = false;
  public isEdit: boolean = false;
  public currentVoucher: any = this.resetVoucher(); // Changed to any to handle Date objects
  public totalPages: number = 0;
  public currentPage: number = 0;
  public pageSize: number = 10;
  public loading: boolean = false;
  public searchKeyword: string = '';
  
  public filterOptions = [
    { label: 'Đang hoạt động', value: 'active' },
    { label: 'Còn hiệu lực', value: 'valid' },
    { label: 'Tất cả', value: 'all' }
  ];
  public selectedFilter: string = 'active';

  constructor(
    private voucherService: VoucherService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadVouchers();
  }

  loadVouchers(): void {
    this.loading = true;
    this.voucherService.getAllVouchers(this.currentPage, this.pageSize, this.selectedFilter).pipe(
      tap((response) => {
        // Handle different response types
        if (response && typeof response === 'object') {
          if ('message' in response && response.message === 'Không có voucher') {
            this.vouchers = [];
            this.totalPages = 0;
          } else if ('vouchers' in response) {
            this.vouchers = response.vouchers || [];
            this.totalPages = response.totalPages || 0;
          }
        }
        this.loading = false;
      }),
      catchError((err) => {
        this.loading = false;
        // Handle message response from error
        if (err.error && err.error.message === 'Không có voucher') {
          this.vouchers = [];
          this.totalPages = 0;
        } else if (err.status === 200 && err.error?.text?.includes('Không có voucher')) {
          this.vouchers = [];
          this.totalPages = 0;
        } else {
          this.toastService.fail('Lỗi khi tải danh sách voucher');
        }
        return of(err);
      })
    ).subscribe();
  }

  searchVouchers(): void {
    if (this.searchKeyword.trim()) {
      this.loading = true;
      this.voucherService.searchVouchers(this.searchKeyword, this.currentPage, this.pageSize).pipe(
        tap((response) => {
          this.vouchers = response.vouchers || [];
          this.totalPages = response.totalPages || 0;
          this.loading = false;
        }),
        catchError((err) => {
          this.loading = false;
          this.toastService.fail('Lỗi khi tìm kiếm voucher');
          return of(err);
        })
      ).subscribe();
    } else {
      this.loadVouchers();
    }
  }

  showAddDialog(): void {
    this.visible = true;
    this.isEdit = false;
    this.currentVoucher = this.resetVoucher();
  }

  showEditDialog(voucher: VoucherDto): void {
    this.visible = true;
    this.isEdit = true;
    this.currentVoucher = { ...voucher };
    
    // Convert date arrays to Date objects for calendar
    if (this.currentVoucher.valid_from) {
      if (Array.isArray(this.currentVoucher.valid_from)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = this.currentVoucher.valid_from as any;
        this.currentVoucher.valid_from = new Date(year, month - 1, day, hour, minute, second);
      } else {
        this.currentVoucher.valid_from = new Date(this.currentVoucher.valid_from);
      }
    }
    
    if (this.currentVoucher.valid_to) {
      if (Array.isArray(this.currentVoucher.valid_to)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = this.currentVoucher.valid_to as any;
        this.currentVoucher.valid_to = new Date(year, month - 1, day, hour, minute, second);
      } else {
        this.currentVoucher.valid_to = new Date(this.currentVoucher.valid_to);
      }
    }
  }

  saveVoucher(): void {
    if (!this.validateVoucher()) {
      return;
    }

    // Convert Date objects to ISO strings for API
    const voucherData = { 
      ...this.currentVoucher,
      valid_from: this.currentVoucher.valid_from instanceof Date 
        ? this.currentVoucher.valid_from.toISOString() 
        : this.currentVoucher.valid_from,
      valid_to: this.currentVoucher.valid_to instanceof Date 
        ? this.currentVoucher.valid_to.toISOString() 
        : this.currentVoucher.valid_to
    };
    
    if (this.isEdit && this.currentVoucher.id) {
      this.voucherService.updateVoucher(this.currentVoucher.id, voucherData).pipe(
        tap((response) => {
          this.toastService.success('Cập nhật voucher thành công');
          this.visible = false;
          this.loadVouchers();
        }),
        catchError((err) => {
          if (err.error === 'Mã voucher bị trùng') {
            this.toastService.fail('Mã voucher đã tồn tại');
          } else {
            this.toastService.fail(err.error || 'Lỗi khi cập nhật voucher');
          }
          return of(err);
        })
      ).subscribe();
    } else {
      this.voucherService.createVoucher(voucherData).pipe(
        tap((response) => {
          this.toastService.success('Thêm voucher thành công');
          this.visible = false;
          this.loadVouchers();
        }),
        catchError((err) => {
          if (err.error === 'Thiếu thông tin cần thiết') {
            this.toastService.fail('Vui lòng điền đầy đủ thông tin bắt buộc');
          } else if (err.error === 'Mã voucher bị trùng') {
            this.toastService.fail('Mã voucher đã tồn tại');
          } else {
            this.toastService.fail(err.error || 'Lỗi khi tạo voucher');
          }
          return of(err);
        })
      ).subscribe();
    }
  }

  confirmDelete(voucher: VoucherDto): void {
    this.confirmationService.confirm({
      message: `Bạn chắc chắn muốn xóa voucher "${voucher.name}"?`,
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        if (voucher.id) {
          this.voucherService.deleteVoucher(voucher.id).pipe(
            tap(() => {
              this.toastService.success('Xóa voucher thành công');
              this.loadVouchers();
            }),
            catchError((err) => {
              if (err.error?.includes('Không thể xóa voucher đang được sử dụng')) {
                this.toastService.fail('Không thể xóa voucher đang được sử dụng trong đơn hàng');
              } else {
                this.toastService.fail('Lỗi khi xóa voucher');
              }
              return of(err);
            })
          ).subscribe();
        }
      }
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.page;
    this.pageSize = event.rows;
    this.loadVouchers();
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadVouchers();
  }

  validateVoucher(): boolean {
    if (!this.currentVoucher.code || !this.currentVoucher.name || 
        !this.currentVoucher.discount_percentage || !this.currentVoucher.quantity ||
        !this.currentVoucher.valid_from || !this.currentVoucher.valid_to) {
      this.toastService.fail('Vui lòng điền đầy đủ thông tin bắt buộc');
      return false;
    }

    if (this.currentVoucher.discount_percentage < 1 || this.currentVoucher.discount_percentage > 100) {
      this.toastService.fail('Phần trăm giảm giá phải từ 1 đến 100');
      return false;
    }

    let fromDate: Date;
    let toDate: Date;
    
    // Handle different date formats
    if (Array.isArray(this.currentVoucher.valid_from)) {
      const [year, month, day, hour = 0, minute = 0] = this.currentVoucher.valid_from;
      fromDate = new Date(year, month - 1, day, hour, minute);
    } else if (this.currentVoucher.valid_from instanceof Date) {
      fromDate = this.currentVoucher.valid_from;
    } else {
      fromDate = new Date(this.currentVoucher.valid_from);
    }
    
    if (Array.isArray(this.currentVoucher.valid_to)) {
      const [year, month, day, hour = 0, minute = 0] = this.currentVoucher.valid_to;
      toDate = new Date(year, month - 1, day, hour, minute);
    } else if (this.currentVoucher.valid_to instanceof Date) {
      toDate = this.currentVoucher.valid_to;
    } else {
      toDate = new Date(this.currentVoucher.valid_to);
    }

    if (fromDate >= toDate) {
      this.toastService.fail('Ngày bắt đầu phải trước ngày kết thúc');
      return false;
    }

    return true;
  }

  resetVoucher(): any {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return {
      code: '',
      name: '',
      description: '',
      discount_percentage: 0,
      min_order_value: 0,
      max_discount_amount: undefined,
      quantity: 1,
      valid_from: now,
      valid_to: thirtyDaysFromNow,
      is_active: true
    };
  }

  getStatusSeverity(voucher: VoucherDto): "success" | "secondary" | "info" | "warning" | "danger" | "contrast" | undefined {
    if (!voucher.is_active) return 'danger';
    if (voucher.is_valid) return 'success';
    if (voucher.remaining_quantity === 0) return 'warning';
    return 'secondary';
  }

  getStatusLabel(voucher: VoucherDto): string {
    if (!voucher.is_active) return 'Không hoạt động';
    if (voucher.remaining_quantity === 0) return 'Hết số lượng';
    if (voucher.is_valid) return 'Đang hiệu lực';
    return 'Hết hạn';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  }

  formatDate(dateInput: any): string {
    if (!dateInput) return '';
    
    try {
      let date: Date;
      
      // Handle array format from Spring Boot LocalDateTime
      // Format: [year, month, day, hour, minute, second?]
      if (Array.isArray(dateInput) && dateInput.length >= 3) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateInput;
        // Month is 1-based from backend, but JavaScript Date uses 0-based months
        date = new Date(year, month - 1, day, hour, minute, second);
      } else if (dateInput instanceof Date) {
        date = dateInput;
      } else if (typeof dateInput === 'string') {
        date = new Date(dateInput);
      } else {
        return '';
      }
      
      // Check if date is valid
      if (!date || isNaN(date.getTime())) {
        console.warn('Invalid date:', dateInput);
        return '';
      }
      
      // Format as dd/mm/yyyy
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formatting date:', dateInput, error);
      return '';
    }
  }
} 