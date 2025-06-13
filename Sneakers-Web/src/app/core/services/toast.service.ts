import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(
    private readonly messageService : MessageService
  ) { }

  success(content : string){
    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: content});
  }

  fail(content : string){
    this.messageService.add({ severity: 'error', summary: 'Thất bại', detail: content});
  }

  accountBlocked(content : string){
    this.messageService.add({ 
      severity: 'error', 
      summary: 'Tài khoản bị khóa', 
      detail: content,
      life: 5000,
      sticky: true
    });
  }
}
