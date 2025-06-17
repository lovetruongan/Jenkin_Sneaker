import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryManageComponent } from './category-manage.component';

describe('CategoryManageComponent', () => {
  let component: CategoryManageComponent;
  let fixture: ComponentFixture<CategoryManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryManageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CategoryManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});