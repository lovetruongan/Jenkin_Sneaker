import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { UserService } from '../../../core/services/user.service';
import { catchError, filter, of, tap } from 'rxjs';
import { UserDto } from '../../../core/dtos/user.dto';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RegisteredMessage } from '@angular/cdk/a11y';
import { registerReq } from '../../../core/types/registerReq';
import { SourceTextModule } from 'vm';

export interface UserOption {
  label: string;
  value: any;
}

@Component({
  selector: 'app-user-manage',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    FormsModule,
    DatePipe,
    MatTooltipModule
  ],
  templateUrl: './user-manage.component.html',
  styleUrls: ['./user-manage.component.scss']
})
export class UserManageComponent extends BaseComponent implements OnInit {
  public userOptions: UserOption[] = [
    { label: 'Người dùng', value: 1 },
    { label: 'Quản trị viên', value: 2 },
  ];

  searchTerm: string = '';
  filterLsedUsers: any[] = [];

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
    if (!this.users || !this.userId) return [];
    return this.users.filter(user => user?.id != null && this.userId !== user.id);
  }

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    super();
    if (typeof localStorage !== 'undefined') {
      this.userId = parseInt(JSON.parse(localStorage.getItem("userInfor") || '').id);
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.userService.getAllUser().pipe(
        filter((users: UserDto[]) => !!users),
        tap((users: UserDto[]) => {
          console.log('Danh sách users:', users);
          this.users = users;
          this.filterLsedUsers = this.users;
        })
      ).subscribe();
    }
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
      is_active: this.editingUser.is_active
    };

    this.userService.updateUser(updateData).pipe(
      tap((res: { users: UserDto[], message: string } | UserDto) => {
        // Handle different response formats
        if ('users' in res) {
          // If response contains users array
          this.users = res.users;
          this.showSuccessMessage(res.message || 'Cập nhật thông tin người dùng thành công!'); 
        } else {
          // If response is single user
          const updatedUser = res as UserDto;
          const index = this.users.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
          }
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
    // Prepare data for API

    const errors = this.validateAddUser();
    if (errors.length > 0) {
      alert(errors.join('\n')); // Hoặc hiển thị bằng UI component
      return;
    }
    this.addUser.retype_password = this.addUser.password;

    this.userService.register(this.addUser).subscribe({
      next: (res: any) => {
        this.showSuccessMessage('Thêm thành công!');
      },
      error: (err) => {
        this.showErrorMessage(err.error?.message || 'Thêm không thành công!');
        // TODO: Hiển thị lỗi cho người dùng
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
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  confirmDelete(id: number) {
    const confirmed = confirm('Xóa người dùng đồng nghĩa xóa tất cả đơn hàng, thông tin của người dùng. Bạn có chắc muốn xóa người dùng này?');

    if (confirmed) {
      this.userService.deleteUser(id).pipe(
        tap((res: { users: UserDto[], message: string }) => {
          this.users = res.users;
          this.snackBar.open(res.message, 'Đóng', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        }),
        catchError((err) => {
          this.snackBar.open(err.error.message, 'Đóng', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          return of(err);
        })
      ).subscribe();
    }
  }

  getRoleName(user: any): string {
    const roleId = user?.role?.id;
    return roleId != null ? this.roleMap[roleId - 1] : 'Không xác định';
  }

  onCategoryChange(userId: number, event: any) {
    this.userService.changeRoleUser(event.value, userId).pipe(
      tap((res: { users: UserDto[], message: string }) => {
        this.users = res.users;
        this.snackBar.open(res.message, 'Đóng', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }),
      catchError((err) => {
        this.snackBar.open(err.error.message, 'Đóng', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return of(err);
      })
    ).subscribe();
  }

  changeActiveStatus(user: UserDto) {
    const newStatus = !user.is_active;

    if (user.id == null) {
      this.showErrorMessage('Không xác định được ID người dùng.');
      return;
    }
    this.userService.changeActive(user.id, newStatus).pipe(
      tap((res: UserDto) => {
        const index = this.users.findIndex(u => u.id === res.id);
        if (index !== -1) {
          this.users[index] = res;
        }
        this.snackBar.open(
          `Cập nhật trạng thái người dùng thành công`,
          'Đóng',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
      }),
      catchError(err => {
        this.snackBar.open(
          err.error.message || 'Cập nhật trạng thái thất bại',
          'Đóng',
          { duration: 3000, panelClass: ['error-snackbar'] }
        );
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
      date_of_birth: new Date(), // hoặc null nếu bạn sửa DTO hỗ trợ null
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

  filterUsers() {
    const term = this.searchTerm?.toLowerCase().trim();
    if (!term) {
      this.filterLsedUsers = this.users;
    } else {
      this.filterLsedUsers = this.users.filter(user =>
        user.fullname?.toLowerCase().includes(term)
      );
    }
  }

}