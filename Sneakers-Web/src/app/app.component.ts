import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { AccountMonitorService } from './core/services/account-monitor.service';
import { AccountBlockedModalComponent } from './shared/components/account-blocked-modal/account-blocked-modal.component';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    CommonModule, 
    AccountBlockedModalComponent,
    ToastModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Sneakers-Ui';
  isBlockedModalVisible: boolean = false;
  private modalSubscription!: Subscription;

  constructor(
    public accountMonitor: AccountMonitorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.modalSubscription = this.accountMonitor.showBlockedModal$.subscribe(isVisible => {
      if (this.isBlockedModalVisible !== isVisible) {
        this.isBlockedModalVisible = isVisible;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
  }
}
