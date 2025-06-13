import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { UserService } from '../../../core/services/user.service';
import { catchError, filter, of, tap } from 'rxjs';
import { UserDto } from '../../../core/dtos/user.dto';
import { registerReq } from '../../../core/types/registerReq';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessageService, ConfirmationService } from 'primeng/api';

export interface UserOption {
  label: string;
  value: any;
}

@Component({
  selector: 'app-user-manage',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    CardModule,
    TagModule,
    TooltipModule,
    CalendarModule,
    InputTextareaModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './user-manage.component.html',
  styleUrls: ['./user-manage.component.scss']
})
export class UserManageComponent extends BaseComponent implements OnInit {
  public userOptions: UserOption[] = [
    { label: 'Người dùng', value: 1 },
    { label: 'Quản trị viên', value: 2 },
  ];

  public statusOptions = [
    { label: 'Hoạt động', value: true },
    { label: 'Vô hiệu', value: false }
  ];

  searchTerm: string = '';
  filterLsedUsers: any[] = [];
  loading: boolean = false;
  showSearchDialog: boolean = false;
  selectedRole: any = null;
  selectedStatus: any = null;

  public roleMap = [
    'Người dùng',
    'Quản trị viên',
  ];

  public userId!: number;
  public users: UserDto[] = [];

  // Properties for edit functionality
  public showEditDialog = false;
  public showAddDialog = false;
  public editingUser: UserDto = {} as UserDto;
  public originalUser: UserDto = {} as UserDto;
  public addUser: registerReq = {} as registerReq;

  displayedColumns: string[] = [
    'fullname',
    'phone',
    'email',
    'address',
    'dateOfBirth',
    'status',
    'role',
    'actions'
  ];

  get filteredUsers(): UserDto[] {
    if (!this.users) return [];
    
    let filtered = this.users.filter(user => {
      // Filter out current user if userId is set
      if (this.userId && user?.id === this.userId) {
        return false;
      }
      return user?.id != null;
    });
    
    // Apply search filter
    if (this.searchTerm && this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(user => 
        user.fullname?.toLowerCase().includes(searchLower) ||
        user.phone_number?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.address?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply role filter
    if (this.selectedRole !== null && this.selectedRole !== undefined) {
      filtered = filtered.filter(user => user.role?.id === this.selectedRole);
    }
    
    // Apply status filter
    if (this.selectedStatus !== null && this.selectedStatus !== undefined) {
      filtered = filtered.filter(user => user.is_active === this.selectedStatus);
    }
    
    return filtered;
  }

  get totalRecords(): number {
    return this.filteredUsers.length;
  }

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    super();
    if (typeof localStorage !== 'undefined') {
      this.userId = parseInt(JSON.parse(localStorage.getItem("userInfor") || '{}').id);
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.getUsers();
    }
  }

  private getUsers(): void {
    this.loading = true;
    this.userService.getAllUser().pipe(
      filter((users: UserDto[]) => !!users),
      tap((users: UserDto[]) => {
        this.users = users;
        this.filterLsedUsers = this.users;
        this.loading = false;
      }),
      catchError(err => {
        this.loading = false;
        this.showErrorMessage('Không thể tải danh sách người dùng');
        return of([]);
      })
    ).subscribe();
  }

  // Search and filter methods
  resetSearch(): void {
    this.searchTerm = '';
    this.selectedRole = null;
    this.selectedStatus = null;
  }

  applyFilter(): void {
    // The filtering is automatically applied via the getter
    // This method can be used for additional logic if needed
  }

  filterUsers(): void {
    // This method is called when searchTerm changes
    // The actual filtering is done in the filteredUsers getter
  }

  // Edit user functionality
  editUser(user: UserDto): void {
    this.editingUser = {
      ...user,
      date_of_birth: user.date_of_birth ? new Date(user.date_of_birth) : new Date()
    };
    this.originalUser = { ...user };
    this.showEditDialog = true;
  }

  closeEditDialog(): void {
    this.showEditDialog = false;
    this.editingUser = {} as UserDto;
    this.originalUser = {} as UserDto;
  }

  closeAddDialog(): void {
    this.showAddDialog = false;
    this.addUser = {} as registerReq;
  }

  saveUser(): void {
    if (!this.validateUserData()) {
      return;
    }

    // Prepare data for API
    const updateData = {
      id: this.editingUser.id,
      fullname: this.editingUser.fullname?.trim(),
      phone_number: this.editingUser.phone_number?.trim(),
      address: this.editingUser.address?.trim(),
      date_of_birth: this.editingUser.date_of_birth,
      role_id: this.editingUser.role?.id,
      is_active: this.editingUser.is_active,
      email: this.editingUser.email
    };


    this.userService.updateUser(updateData).pipe(
      tap((res: { users: UserDto[], message: string } | UserDto) => {
        // Handle different response formats
        if ('users' in res) {
          // Nếu response có users array
          // Reload lại danh sách
          this.getUsers();
          this.showSuccessMessage(res.message || 'Cập nhật thông tin người dùng thành công!');
        } else {
          // Nếu response là user đơn lẻ
          // Reload lại danh sách
          this.getUsers();
          this.showSuccessMessage('Cập nhật thông tin người dùng thành công!');
        }
        this.closeEditDialog();
      }),
      catchError((err) => {
        console.error('Error updating user:', err);
        this.showErrorMessage(err.error?.message || 'Có lỗi xảy ra khi cập nhật thông tin người dùng!');
        return of(err);
      })
    ).subscribe();
  }

  addUserF(): void {
    this.addUser.retype_password = this.addUser.password;
    const errors = this.validateAddUser();
    if (errors.length > 0) {
      this.showErrorMessage(errors.join(', '));
      return;
    }

    this.userService.register(this.addUser).subscribe({
      next: (res: any) => {
        this.showSuccessMessage('Thêm thành công!');
        this.getUsers();
        this.closeAddDialog();
      },
      error: (err) => {
        this.showErrorMessage(err.error?.message || 'Thêm không thành công!');
      }
    });
  }

  private validateUserData(): boolean {
    if (!this.editingUser.fullname?.trim()) {
      this.showErrorMessage('Vui lòng nhập họ tên!');
      return false;
    }

    if (!this.editingUser.phone_number?.trim()) {
      this.showErrorMessage('Vui lòng nhập số điện thoại!');
      return false;
    }

    // Validate phone number format
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(this.editingUser.phone_number.replace(/\s/g, ''))) {
      this.showErrorMessage('Số điện thoại không hợp lệ! Vui lòng nhập 10-11 chữ số.');
      return false;
    }

    if (!this.editingUser.address?.trim()) {
      this.showErrorMessage('Vui lòng nhập địa chỉ!');
      return false;
    }

    if (!this.editingUser.date_of_birth) {
      this.showErrorMessage('Vui lòng chọn ngày sinh!');
      return false;
    }

    if (!this.editingUser.role?.id) {
      this.showErrorMessage('Vui lòng chọn vai trò!');
      return false;
    }

    return true;
  }

  private showSuccessMessage(message: string): void {
    this.messageService.add({severity: 'success', summary: 'Thành công', detail: message});
  }

  private showErrorMessage(message: string): void {
    this.messageService.add({severity: 'error', summary: 'Lỗi', detail: message});
  }

  confirmDelete(id: number) {
    this.confirmationService.confirm({
      message: 'Xóa người dùng đồng nghĩa xóa tất cả đơn hàng, thông tin của người dùng. Bạn có chắc muốn xóa người dùng này?',
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.deleteUser(id).pipe(
          tap((res: { users: UserDto[], message: string }) => {
            this.getUsers();
            this.messageService.add({severity: 'success', summary: 'Thành công', detail: res.message});
          }),
          catchError((err) => {
            this.messageService.add({severity: 'error', summary: 'Lỗi', detail: err.error.message});
            return of(err);
          })
        ).subscribe();
      }
    });
  }

  getRoleName(user: any): string {
    const roleId = user?.role?.id;
    return roleId != null ? this.roleMap[roleId - 1] : 'Không xác định';
  }

  onCategoryChange(userId: number, event: any) {
    this.userService.changeRoleUser(event.value, userId).pipe(
      tap((res: { users: UserDto[], message: string }) => {
        this.getUsers();
        this.messageService.add({severity: 'success', summary: 'Thành công', detail: res.message});
      }),
      catchError((err) => {
        this.messageService.add({severity: 'error', summary: 'Lỗi', detail: err.error.message});
        return of(err);
      })
    ).subscribe();
  }

  onRoleChange(event: any, userId: number) {
    this.onCategoryChange(userId, event);
  }

  changeActiveStatus(user: UserDto) {
    const newStatus = !user.is_active;

    if (user.id == null) {
      this.showErrorMessage('Không xác định được ID người dùng.');
      return;
    }
    this.userService.changeActive(user.id, newStatus).pipe(
      tap((res: UserDto) => {
        this.getUsers();
        this.messageService.add({severity: 'success', summary: 'Thành công', detail: 'Cập nhật trạng thái người dùng thành công'});
      }),
      catchError(err => {
        this.messageService.add({severity: 'error', summary: 'Lỗi', detail: err.error.message || 'Cập nhật trạng thái thất bại'});
        return of(err);
      })
    ).subscribe();
  }

  openAddUserDialog(): void {
    this.addUser = {
      fullname: '',
      phone_number: '',
      password: '',
      email: '',
      retype_password: '',
      address: '',
      date_of_birth: new Date(),
    };
    this.originalUser = {} as UserDto;
    this.showAddDialog = true;
  }

  validateAddUser(): string[] {
    const errors: string[] = [];

    const user = this.addUser;

    if (!user.fullname || !user.fullname.trim()) {
      errors.push('Họ tên không được để trống.');
    }

    if (!user.phone_number || !user.phone_number.trim()) {
      errors.push('Số điện thoại không được để trống.');
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(user.phone_number)) {
      errors.push('Số điện thoại không hợp lệ.');
    }

    if (!user.password || user.password.length < 6) {
      errors.push('Mật khẩu phải có ít nhất 6 ký tự.');
    }

    if (user.password !== user.retype_password) {
      errors.push('Mật khẩu nhập lại không khớp.');
    }

    if (!user.date_of_birth) {
      errors.push('Ngày sinh không được để trống.');
    }

    return errors;
  }
}
