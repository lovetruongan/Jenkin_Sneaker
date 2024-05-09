import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadProductComponent } from './upload-product.component';

describe('UploadProductComponent', () => {
  let component: UploadProductComponent;
  let fixture: ComponentFixture<UploadProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadProductComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UploadProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});