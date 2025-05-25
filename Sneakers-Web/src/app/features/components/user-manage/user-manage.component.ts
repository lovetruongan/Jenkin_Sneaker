import { Component, OnInit } from '@angular/core';
import { PanelModule } from 'primeng/panel';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { UserService } from '../../../core/services/user.service';
import { catchError, filter, of, tap } from 'rxjs';
import { UserDto } from '../../../core/dtos/user.dto';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-user-manage',
  standalone: true,
  imports: [
    PanelModule,
    DropdownModule,
    DatePipe,
    ButtonModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [
    MessageService,
    ToastService,
    ConfirmationService
  ],
  templateUrl: './user-manage.component.html',
  styleUrl: './user-manage.component.scss'
})
export class UserManageComponent extends BaseComponent implements OnInit{
  public userOptions: MenuItem[] = [
    { label: 'Người dùng', value: 1 },
    { label: 'Quản trị viên', value: 2 },
  ];
  public roleMap = [
    'Người dùng',
    'Quản trị viên',
  ];
  public userId!: number;

  public users: UserDto[] = [];

  constructor(
    private userService: UserService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) {
    super();
    if (typeof localStorage !== 'undefined'){
      this.userId = parseInt(JSON.parse(localStorage.getItem("userInfor") || '').id);
    }
  }

  ngOnInit(): void {
    this.userService.getAllUser().pipe(
      filter((users: UserDto[]) => !!users),
      tap((users: UserDto[]) => {
        this.users = users;
      })
    ).subscribe();
  }

  confirmDelete(id: number) {
    this.confirmationService.confirm({
        message: 'Xóa người dùng đồng nghĩa xóa tất cả đơn hàng, thông tin của người dùng. Bạn có chắc muốn xóa người dùng này?',
        header: 'Xác nhận',
        icon: 'pi pi-exclamation-triangle',
        acceptIcon:"none",
        rejectIcon:"none",
        rejectButtonStyleClass:"p-button-text",
        accept: () => {
          this.userService.deleteUser(id).pipe(
            tap((res: {users: UserDto[],message: string}) => {
              this.toastService.success(res.message);
              this.users = res.users;
            }),
            catchError((err) => {
              this.toastService.fail(err.error.message);
              return of(err);
            })
          ).subscribe();
        },
        reject: () => {
        }
    });
  }

  onCategoryChange(userId: number, event: any){
    this.userService.changeRoleUser(event.value, userId).pipe(
      tap((res: {users: UserDto[],message: string}) => {
        this.toastService.success(res.message);
        this.users = res.users;
      }),
      catchError((err) => {
        this.toastService.fail(err.error.message);
        return of(err);
      })
    ).subscribe();
  }
}
