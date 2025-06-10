import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { VoucherService } from '../../../core/services/voucher.service';
import { VoucherDto } from '../../../core/dtos/voucher.dto';
import { catchError, of, tap } from 'rxjs';
import { RouterModule } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-voucher-display',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastModule, CurrencyPipe],
  templateUrl: './voucher-display.component.html',
  styleUrls: ['./voucher-display.component.scss'],
  providers: [ToastService, MessageService]
})
export class VoucherDisplayComponent implements OnInit {
  vouchers: VoucherDto[] = [];
  isLoading = true;

  constructor(
    private voucherService: VoucherService,
    private toastService: ToastService
    ) {}

  ngOnInit(): void {
    this.voucherService.getAllVouchers(0, 5, 'valid').pipe(
      tap(response => {
        if(response && response.vouchers) {
          this.vouchers = response.vouchers;
        }
        this.isLoading = false;
      }),
      catchError(error => {
        console.error('Error fetching vouchers:', error);
        this.isLoading = false;
        return of(null);
      })
    ).subscribe();
  }

  copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      this.toastService.success('Đã sao chép mã voucher!');
    }).catch(err => {
      this.toastService.fail('Không thể sao chép mã.');
      console.error('Could not copy text: ', err);
    });
  }
} 