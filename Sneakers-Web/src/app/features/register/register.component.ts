import { AfterViewInit, Component } from '@angular/core';
import { BaseComponent } from '../../core/commonComponent/base.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastService } from '../../core/services/toast.service';
import { ToastModule } from 'primeng/toast';
import { Subject, catchError, delay, filter, of, switchMap, takeUntil, tap } from 'rxjs';
import { PasswordModule } from 'primeng/password';
import { UserService } from '../../core/services/user.service';
import { KeyFilterModule } from 'primeng/keyfilter';
import { BlockUIModule } from 'primeng/blockui';
import { ProgressSpinnerModule } from 'primeng/progressspinner';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ButtonModule,
    ReactiveFormsModule,
    RouterModule,
    InputTextModule,
    ToastModule,
    PasswordModule,
    KeyFilterModule,
    BlockUIModule,
    ProgressSpinnerModule
  ],
  providers: [
    MessageService,
    ToastService
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent extends BaseComponent implements AfterViewInit {
  public registerForm : FormGroup;
  public formGroupSubmitSubject = new Subject<void>();
  public formGroup$ = this.formGroupSubmitSubject.asObservable();
  public blockedUi: boolean = false;

  constructor(
    private readonly fb : FormBuilder,
    private readonly toastService : ToastService,
    private readonly userService : UserService,
    private router : Router
    
  ) {
    super();
    this.registerForm = this.fb.group({
      fullName: [,Validators.required],
      phoneNumber: [,Validators.required],
      password: [,Validators.required],
      retypePassword: [,Validators.required],
      date: [,Validators.required],
      address: [,Validators.required],
    })
  }

  ngAfterViewInit(): void {
      this.formGroup$.pipe(
        filter(() => {
          if (this.registerForm.invalid){
            this.toastService.fail("Vui lòng điền đầy đủ thông tin");
            return false;
          } else if (this.registerForm.value.password != this.registerForm.value.retypePassword){
            this.toastService.fail("Mật khẩu chưa khớp với nhau, vui lòng kiểm tra lại");
            return false;
          }
          return true;
        }),
        switchMap(() => {
          return this.userService.register({
            fullname: this.registerForm.value.fullName,
            phone_number: this.registerForm.value.phoneNumber,
            address: this.registerForm.value.address,
            password: this.registerForm.value.password,
            retype_password: this.registerForm.value.retypePassword,
            date_of_birth: this.registerForm.value.date,
            email: this.registerForm.value.email
          }).pipe(
            tap(() => {
              this.toastService.success("Đăng ký thành công");
              this.blockUi();
            }),
            delay(1000),
            tap(() => {
              this.router.navigateByUrl('/auth-login')
            }),
            catchError((registerError) => {
              this.toastService.fail(registerError.error.message)
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
}
