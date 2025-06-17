import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { takeUntil, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';


@Component({
  selector: 'app-payment-banking',
  standalone: true,
  imports: [
   CommonModule, ButtonModule, MessagesModule
  ],
  templateUrl: './payment-banking.component.html',
  styleUrls: ['./payment-banking.component.scss']
})
export class PaymentBankingComponent extends BaseComponent implements OnInit {
  public paymentId!: number;
  public amount!: number;
  public orderId!: number;
  public bankInfo = {
    bankName: 'Ngân hàng TMCP Á Châu (ACB)',
    accountNumber: '123456789',
    accountName: 'SNEAKER STORE',
    transferContent: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(
      tap(params => {
        this.paymentId = params['paymentId'];
        this.amount = params['amount'];
        this.orderId = params['orderId'];
        this.bankInfo.transferContent = `THANHTOAN ${this.orderId} ${this.paymentId}`;
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // Show success message
    });
  }

  confirmPayment(): void {
    this.router.navigate(['/payment/success'], {
      queryParams: {
        paymentId: this.paymentId,
        method: 'BANKING'
      }
    });
  }
}
