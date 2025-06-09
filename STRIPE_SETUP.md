# Stripe Setup Quick Guide

## 🚀 Cài đặt nhanh Stripe cho Shop Sneakers

### 1. Tạo tài khoản Stripe
1. Truy cập [https://stripe.com](https://stripe.com)
2. Đăng ký tài khoản mới
3. Xác thực email và thông tin cơ bản

### 2. Lấy API Keys
1. Đăng nhập vào Stripe Dashboard
2. Chuyển sang Test Mode (toggle ở góc trái)
3. Vào **Developers > API Keys**
4. Copy **Publishable key** và **Secret key**

### 3. Cập nhật Backend Configuration

#### File: `Sneakers_BE/src/main/resources/application.yaml`
```yaml
stripe:
  api:
    secret-key: sk_test_YOUR_ACTUAL_SECRET_KEY_HERE
    publishable-key: pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE
```

#### File: `Sneakers_BE/src/main/java/com/example/Sneakers/controllers/StripeController.java`
```java
@GetMapping("/config")
public ResponseEntity<?> getStripeConfig() {
    return ResponseEntity.ok(
            MessageResponse.builder()
                    .message("pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE")
                    .build()
    );
}
```

### 4. Cập nhật Frontend Configuration

#### File: `Sneakers-Web/src/app/core/services/stripe.service.ts`
```typescript
constructor() {
    this.stripePromise = loadStripe('pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE');
}
```

### 5. Khởi động ứng dụng

#### Backend:
```bash
cd Sneakers_BE
mvn spring-boot:run
```

#### Frontend:
```bash
cd Sneakers-Web
npm start
```

### 6. Test thanh toán

1. Thêm sản phẩm vào giỏ hàng
2. Chọn "Thanh toán bằng thẻ Visa/Mastercard"
3. Sử dụng thẻ test: **4242 4242 4242 4242**
4. MM/YY: **12/34**, CVC: **123**

### 🔧 Environment Variables (Khuyến nghị)

Thay vì hardcode keys, sử dụng environment variables:

#### Backend (.env hoặc IDE configuration):
```bash
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
```

#### Frontend (environment.ts):
```typescript
export const environment = {
    production: false,
    apiUrl: 'http://localhost:8089/api/v1',
    stripePublishableKey: 'pk_test_YOUR_PUBLISHABLE_KEY'
};
```

### 📋 Checklist
- [ ] Tạo tài khoản Stripe
- [ ] Lấy test API keys
- [ ] Cập nhật backend config
- [ ] Cập nhật frontend config  
- [ ] Test thanh toán với thẻ 4242 4242 4242 4242
- [ ] Kiểm tra logs và error handling

### ⚠️ Lưu ý quan trọng
- Luôn sử dụng test keys cho development
- Không commit API keys vào git
- Chuyển sang live keys khi deploy production
- Kiểm tra webhook settings cho production

### 🆘 Troubleshooting
- **401 Unauthorized**: Kiểm tra API keys
- **CORS Error**: Đảm bảo backend chạy trên port 8089
- **Payment Failed**: Sử dụng đúng test card numbers
- **Network Error**: Kiểm tra internet connection 