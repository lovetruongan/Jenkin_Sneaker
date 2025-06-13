import { AfterViewInit, Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { BaseComponent } from '../../../../core/commonComponent/base.component';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastService } from '../../../../core/services/toast.service';
import { Subject, catchError, delay, filter, of, switchMap, takeUntil, tap } from 'rxjs';
import { PasswordModule } from 'primeng/password';
import { UserService } from '../../../../core/services/user.service';
import { loginDetailDto } from '../../../../core/dtos/login.dto';
import { KeyFilterModule } from 'primeng/keyfilter';
import { BlockUIModule } from 'primeng/blockui';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { UserDto } from '../../../../core/dtos/user.dto';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { AccountMonitorService } from '../../../../core/services/account-monitor.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ToastModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    RouterModule,
    PasswordModule,
    KeyFilterModule,
    BlockUIModule,
    ProgressSpinnerModule
  ],
  providers: [
    MessageService,
    ToastService
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent extends BaseComponent implements OnInit, AfterViewInit {
  private token: string | null = null;
  public loginForm: FormGroup;
  public formSubmitSubject = new Subject<void>();
  public formSubmit$ = this.formSubmitSubject.asObservable();
  public blockedUi: boolean = false;
  public showPassword = false;
  
  get userName() {
    return this.loginForm.get('userName');
  }

  get password() {
    return this.loginForm.get('password');
  }
  
  constructor(
    private readonly fb: FormBuilder,
    private readonly messageService: MessageService,
    private toastService: ToastService,
    private userSerivce: UserService,
    private router: Router,
    private route: ActivatedRoute,
    public accountMonitor: AccountMonitorService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    super();
    this.loginForm = this.fb.group({
      userName: [, Validators.required],
      password: [, Validators.required],
      rememberMe: [false]
    });
    if (isPlatformBrowser(this.platformId)) {
      console.log('LoginComponent initialized');
      console.log('Current token:', localStorage.getItem('token'));
    }
  }

  ngOnInit(): void {
    // Không cần xử lý query params nữa vì đã có modal global
  }

  ngAfterViewInit(): void {
    this.formSubmit$.pipe(
      filter(() => {
        if (this.loginForm.invalid) {
          this.toastService.fail("Vui lòng kiểm tra lại thông tin");
          return false;
        }
        return true;
      }),
      switchMap(() => {
        console.log('Submitting login form...');
        return this.userSerivce.login({
          phone_number: this.loginForm.value.userName,
          password: this.loginForm.value.password,
        }).pipe(
          tap((loginVal: loginDetailDto) => {
            if (isPlatformBrowser(this.platformId)) {
              console.log('Login successful');
              this.toastService.success(loginVal.message);
              console.log('Saving token to localStorage...');
              localStorage.setItem("token", loginVal.token);
              this.token = loginVal.token;
              console.log('Token saved:', this.token ? 'exists' : 'not found');
              this.blockUi();
            }
          }),
          delay(1000),
          switchMap(() => {
            console.log('Getting user info...');
            return this.userSerivce.getInforUser(this.token).pipe(
              tap((userInfor: UserDto) => {
                if (isPlatformBrowser(this.platformId)) {
                  console.log('Saving user info...');
                  localStorage.setItem("userInfor", JSON.stringify(userInfor));
                  console.log('User info saved');
                }
              })
            );
          }),
          tap(() => {
            if (isPlatformBrowser(this.platformId)) {
              console.log('Redirecting to home page...');
              window.location.href = '/Home';
            }
          }),
          catchError((error) => {
            console.log('--- ERROR CATCH ---');
            console.log('Status:', error.status);
            console.log('Error Object:', error.error);
            console.log('Error Message:', error.error?.message);
            
            const isBlocked = error.status === 400 && error.error?.message?.includes('Tài khoản của bạn đã bị khóa');
            console.log('Is Blocked Condition Met:', isBlocked);

            // Kiểm tra cụ thể nếu lỗi là do tài khoản bị khóa
            if (isBlocked) {
              // Hiển thị modal lớn thông báo tài khoản bị khóa
              this.accountMonitor.showBlockedModal();
            } else {
              // Hiển thị toast cho các lỗi đăng nhập khác
              this.toastService.fail(error.error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
            }
            
            // Ngăn không cho observable tiếp tục và gây ra lỗi không cần thiết
            return of(); 
          })
        )
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  blockUi() {
    this.blockedUi = true;
    setTimeout(() => {
        this.blockedUi = false;
    }, 1000);
  }

  onSubmit() {
    console.log('Form submitted');
    this.formSubmitSubject.next();
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.formSubmitSubject.next();
    }
  }
}
