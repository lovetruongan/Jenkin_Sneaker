import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors } from '@angular/forms';

@Directive({
  selector: '[appCustomRequired]',
  providers: [{
    provide: NG_VALIDATORS,
    useExisting:CustomRequiredDirective,
    multi:true
  }],
  standalone: true
})
export class CustomRequiredDirective {
  static required(control: AbstractControl) : ValidationErrors | null {
    if (control.value === ''){
      return {required : true}
    }
    return null;
  }

}
