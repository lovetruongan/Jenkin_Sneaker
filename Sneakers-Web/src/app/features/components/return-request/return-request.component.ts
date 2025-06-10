import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReturnService } from '../../../core/services/return.service';
import { ToastService } from '../../../core/services/toast.service';
import { OrderService } from '../../../core/services/order.service';
import { InfoOrderDto } from '../../../core/dtos/InfoOrder.dto';
import { environment } from '../../../../environments/environment';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-return-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ProgressSpinnerModule],
  providers: [MessageService, ToastService],
  templateUrl: './return-request.component.html',
  styleUrls: ['./return-request.component.scss']
})
export class ReturnRequestComponent implements OnInit {
  returnForm: FormGroup;
  orderId: number = 0;
  order: InfoOrderDto | null = null;
  isLoading = true;
  isSubmitting = false;
  apiImage: string = environment.apiImage;
  private readonly isBrowser: boolean;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private returnService: ReturnService,
    private toastService: ToastService,
    private orderService: OrderService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.returnForm = this.fb.group({
      reason: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
    });
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.route.paramMap.subscribe(params => {
      this.orderId = Number(params.get('orderId'));
      if (this.orderId) {
        this.loadOrderDetails();
      } else {
        this.toastService.fail('Order ID not found.');
        this.router.navigate(['/history']);
      }
    });
  }

  loadOrderDetails(): void {
    this.isLoading = true;
    this.orderService.getOrderInfor(this.orderId).subscribe({
      next: (data) => {
        this.order = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.fail('Failed to load order details. ' + (err.error?.message || ''));
        this.router.navigate(['/history']);
      }
    });
  }

  onSubmit(): void {
    if (this.returnForm.invalid || this.isSubmitting) {
      this.returnForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const requestData = {
      order_id: this.orderId,
      reason: this.returnForm.value.reason
    };

    this.returnService.createReturnRequest(requestData).subscribe({
      next: () => {
        this.toastService.success('Return request submitted successfully!');
        this.router.navigate(['/my-returns']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toastService.fail('Failed to submit return request. ' + (err.error?.message || ''));
      }
    });
  }
} 