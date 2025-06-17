import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { UserDto } from '../../../core/dtos/user.dto';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  profileForm: FormGroup;
  user: UserDto | null = null;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.profileForm = this.fb.group({
      fullname: [{ value: '', disabled: true }, Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      phone_number: [{ value: '', disabled: true }, Validators.required],
      address: [{ value: '', disabled: true }, Validators.required],
    });
  }

  ngOnInit(): void {
    this.userService.getInforUser().subscribe(
      (response: UserDto) => {
        this.user = response;
        if (this.user) {
          this.profileForm.patchValue({
            fullname: this.user.fullname,
            email: this.user.email,
            phone_number: this.user.phone_number,
            address: this.user.address,
          });
        }
      }
    );
  }

  enableEditMode(): void {
    this.isEditMode = true;
    this.profileForm.get('fullname')?.enable();
    this.profileForm.get('email')?.enable();
    this.profileForm.get('address')?.enable();
  }

  cancelEdit(): void {
    this.isEditMode = false;
    if (this.user) {
      this.profileForm.patchValue({
        fullname: this.user.fullname,
        email: this.user.email,
        phone_number: this.user.phone_number,
        address: this.user.address,
      });
    }
    this.profileForm.get('fullname')?.disable();
    this.profileForm.get('email')?.disable();
    this.profileForm.get('phone_number')?.disable();
    this.profileForm.get('address')?.disable();
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.user) {
      const updatedData = {
        ...this.profileForm.getRawValue(),
        id: this.user.id
      };
      this.userService.updateUser(updatedData).subscribe(
        (response: any) => {
          console.log('Profile updated successfully', response);
          this.user = { ...this.user, ...this.profileForm.getRawValue() } as UserDto;
          this.isEditMode = false;
          this.profileForm.get('fullname')?.disable();
          this.profileForm.get('email')?.disable();
          this.profileForm.get('phone_number')?.disable();
          this.profileForm.get('address')?.disable();
        },
        (error: any) => {
          console.error('Error updating profile', error);
        }
      );
    }
  }
} 