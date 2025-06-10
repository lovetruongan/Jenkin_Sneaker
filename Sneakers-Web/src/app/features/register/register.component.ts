import { AfterViewInit, Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../core/commonComponent/base.component';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { ToastService } from '../../core/services/toast.service';
import { ToastModule } from 'primeng/toast';
import { Observable, Subject, catchError, delay, filter, of, switchMap, takeUntil, tap } from 'rxjs';
import { PasswordModule } from 'primeng/password';
import { UserService } from '../../core/services/user.service';
import { KeyFilterModule } from 'primeng/keyfilter';
import { BlockUIModule } from 'primeng/blockui';
import { ProgressSpinnerModule } from 'primeng/progressspinner';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ReactiveFormsModule,
    RouterModule,
    InputTextModule,
    CheckboxModule,
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
export class RegisterComponent extends BaseComponent implements OnInit, AfterViewInit {
  public registerForm!: FormGroup;
  public formGroupSubmitSubject = new Subject<void>();
  public formGroup$ = this.formGroupSubmitSubject.asObservable();
  public blockedUi: boolean = false;
  public showPassword = false;
  public showRetypePassword = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly toastService: ToastService,
    private readonly userService: UserService,
    private router: Router
  ) {
    super();
  }
  
  get f() { return this.registerForm.controls; }

  ngOnInit(): void {
    this.initForm();
  }

  ngAfterViewInit(): void {
    this.formGroup$.pipe(
      filter(() => {
        // Mark all fields as touched to display errors
        this.registerForm.markAllAsTouched();
        
        if (this.registerForm.invalid) {
          if (this.registerForm.hasError('passwordMismatch')) {
            this.toastService.fail("Mật khẩu nhập lại không khớp.");
          } else {
            this.toastService.fail("Vui lòng điền đầy đủ và chính xác thông tin.");
          }
          return false;
        }
        return true;
      }),
      switchMap(() => {
        return this.userService.register({
          fullname: this.registerForm.value.fullname,
          phone_number: this.registerForm.value.phone_number,
          address: this.registerForm.value.address,
          password: this.registerForm.value.password,
          retype_password: this.registerForm.value.retypePassword,
          date_of_birth: this.registerForm.value.date_of_birth,
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
            console.error('Registration Error:', registerError);
            if (registerError.status === 400) {
              this.toastService.fail('Tài khoản với số điện thoại hoặc email này đã tồn tại.');
            } else {
              this.toastService.fail(registerError.error?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
            }
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

  private initForm(): void {
    this.registerForm = this.fb.group({
      phone_number: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      fullname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      retypePassword: ['', Validators.required],
      date_of_birth: ['', Validators.required],
      address: ['', Validators.required],
      agreeToTerms: [false, Validators.requiredTrue]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleRetypePassword(): void {
    this.showRetypePassword = !this.showRetypePassword;
  }

  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password');
    const retypePassword = group.get('retypePassword');
    
    if (!password || !retypePassword) {
      return null;
    }
    
    // Set error on retypePassword control to display it under the specific field
    if (password.value !== retypePassword.value) {
      retypePassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      // Clear the error if they match
      if(retypePassword.hasError('passwordMismatch')) {
         retypePassword.setErrors(null);
      }
    }
    return null;
  }

  onSubmit(): void {
    this.formGroupSubmitSubject.next();
  }
}
