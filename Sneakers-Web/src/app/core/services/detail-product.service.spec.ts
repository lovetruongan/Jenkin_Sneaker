import { TestBed } from '@angular/core/testing';

import { DetailProductService } from './detail-product.service';

describe('DetailProductService', () => {
  let service: DetailProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetailProductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
