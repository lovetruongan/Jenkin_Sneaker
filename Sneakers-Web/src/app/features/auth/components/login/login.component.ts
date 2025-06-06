import { AfterViewInit, Component } from '@angular/core';
import { BaseComponent } from '../../../../core/commonComponent/base.component';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { Router, RouterModule } from '@angular/router';
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

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
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
export class LoginComponent extends BaseComponent implements AfterViewInit {
  private token: string | null = null;
  public loginForm: FormGroup;
  public formSubmitSubject = new Subject<void>();
  public formSubmit$ = this.formSubmitSubject.asObservable();
  public blockedUi: boolean = false;
  
  constructor(
    private readonly fb: FormBuilder,
    private readonly messageService: MessageService,
    private toastService: ToastService,
    private userSerivce: UserService,
    private router: Router
  ) {
    super();
    this.loginForm = this.fb.group({
      userName: [, Validators.required],
      password: [, Validators.required]
    });
    console.log('LoginComponent initialized');
    console.log('Current token:', localStorage.getItem('token'));
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
            console.log('Login successful');
            this.toastService.success(loginVal.message);
            console.log('Saving token to localStorage...');
            localStorage.setItem("token", loginVal.token);
            this.token = loginVal.token;
            console.log('Token saved:', this.token ? 'exists' : 'not found');
            this.blockUi();
          }),
          delay(1000),
          switchMap(() => {
            console.log('Getting user info...');
            return this.userSerivce.getInforUser(this.token).pipe(
              tap((userInfor: UserDto) => {
                console.log('Saving user info...');
                localStorage.setItem("userInfor", JSON.stringify(userInfor));
                console.log('User info saved');
              })
            );
          }),
          tap(() => {
            console.log('Redirecting to home page...');
            window.location.href = '/Home';
          }),
          catchError((error) => {
            console.error('Login error:', error);
            this.toastService.fail(error.error.message);
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
}
