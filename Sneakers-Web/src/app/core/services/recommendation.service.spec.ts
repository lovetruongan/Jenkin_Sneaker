import { TestBed } from '@angular/core/testing';
import { RecommendationService } from './recommendation.service';
import { ProductService } from './product.service';
import { UserService } from './user.service';
import { of } from 'rxjs';
import { ProductDto } from '../dtos/product.dto';

describe('RecommendationService', () => {
  let service: RecommendationService;
  let productServiceSpy: jasmine.SpyObj<ProductService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  beforeEach(() => {
    const productSpy = jasmine.createSpyObj('ProductService', ['getAllProduct']);
    const userSpy = jasmine.createSpyObj('UserService', ['getCurrentUser']);

    TestBed.configureTestingModule({
      providers: [
        RecommendationService,
        { provide: ProductService, useValue: productSpy },
        { provide: UserService, useValue: userSpy }
      ]
    });

    service = TestBed.inject(RecommendationService);
    productServiceSpy = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return recommended products', (done) => {
    const mockProducts: ProductDto[] = [
      {
        id: 1,
        name: 'Product 1',
        price: 1000000,
        discount: 10,
        thumbnail: 'image1.jpg',
        description: 'Description 1',
        category_id: 1,
        product_images: []
      },
      {
        id: 2,
        name: 'Product 2',
        price: 2000000,
        discount: 0,
        thumbnail: 'image2.jpg',
        description: 'Description 2',
        category_id: 1,
        product_images: []
      }
    ];

    productServiceSpy.getAllProduct.and.returnValue(of({ 
      products: mockProducts,
      totalProducts: mockProducts.length 
    }));

    service.getRecommendedProducts(2).subscribe(products => {
      expect(products.length).toBe(2);
      expect(products[0]).toBeTruthy();
      expect(products[1]).toBeTruthy();
      done();
    });
  });
}); 