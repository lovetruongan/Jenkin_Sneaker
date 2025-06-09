# Hướng dẫn tích hợp thanh toán Stripe

## Tổng quan
Đã tích hợp thành công phương thức thanh toán bằng thẻ Visa/Mastercard sử dụng Stripe vào hệ thống Shop Sneakers.

## Chức năng đã thêm

### Backend (Spring Boot)
1. **Stripe Configuration** - Cấu hình API keys
2. **Stripe DTOs** - Request/Response models
3. **Stripe Service** - Xử lý payment intents
4. **Stripe Controller** - REST endpoints cho thanh toán

### Frontend (Angular)
1. **Stripe Service** - Angular service tích hợp Stripe JS
2. **Stripe Payment Component** - UI component cho thanh toán
3. **Order Component** - Tích hợp lựa chọn thanh toán Stripe

## Cách sử dụng

### 1. Chọn phương thức thanh toán
- Trong trang checkout, chọn "Thanh toán bằng thẻ Visa/Mastercard"
- Điền đầy đủ thông tin giao hàng
- Nhấn "Tiến hành thanh toán"

### 2. Thanh toán bằng Stripe
- Dialog thanh toán Stripe sẽ hiện ra
- Sử dụng thẻ test được cung cấp:
  - **Số thẻ:** 4242 4242 4242 4242
  - **MM/YY:** 12/34 (hoặc bất kỳ tháng/năm tương lai nào)
  - **CVC:** 123
  - **ZIP:** 12345

### 3. Các thẻ test khác của Stripe
- **Visa:** 4242 4242 4242 4242
- **Visa (debit):** 4000 0566 5566 5556
- **Mastercard:** 5555 5555 5555 4444
- **American Express:** 3782 822463 10005
- **Declined card:** 4000 0000 0000 0002

## API Endpoints

### Stripe Payment APIs
- `POST /api/v1/stripe/create-payment-intent` - Tạo payment intent
- `POST /api/v1/stripe/confirm-payment/{paymentIntentId}` - Xác nhận thanh toán
- `GET /api/v1/stripe/config` - Lấy publishable key

## Cấu hình môi trường

### Backend Configuration (application.yaml)
```yaml
stripe:
  api:
    secret-key: sk_test_51QZgCJRvZ1iLCJCY0123456789abcdef
    publishable-key: pk_test_51QZgCJRvZ1iLCJCYO8RJ4n8GXzL1vWvEuR2pKqWXn2aK5dT6xU9vL4e3sA7bC1yZ8oE
```

### Frontend Configuration
- Stripe Publishable Key được cấu hình trực tiếp trong StripeService
- Sử dụng test keys cho môi trường development

## Luồng thanh toán

1. **Tạo đơn hàng** - Đơn hàng được tạo với trạng thái "Pending Stripe Payment"
2. **Tạo Payment Intent** - Backend tạo Stripe Payment Intent
3. **Xác nhận thanh toán** - Frontend sử dụng Stripe Elements để xác nhận
4. **Cập nhật trạng thái** - Sau khi thanh toán thành công, đơn hàng được cập nhật

## Bảo mật

### Test Mode
- Hiện tại đang sử dụng Stripe test keys
- Không có giao dịch thật được thực hiện
- Tất cả thanh toán chỉ là simulation

### Production Deployment
Khi deploy production, cần:
1. Thay thế test keys bằng live keys
2. Cấu hình webhook endpoints
3. Thiết lập proper error handling
4. Implement proper logging

## Troubleshooting

### Các lỗi thường gặp
1. **"Stripe not initialized"** - Kiểm tra internet connection và Stripe keys
2. **"Payment failed"** - Sử dụng test card numbers chính xác
3. **"Order not found"** - Đảm bảo order được tạo trước khi thanh toán

### Logs
- Backend logs được ghi trong `StripeService`
- Frontend logs hiển thị trong browser console

## Testing

### Test Cases
1. ✅ Thanh toán thành công với thẻ Visa test
2. ✅ Xử lý lỗi với thẻ declined
3. ✅ Hủy thanh toán và quay lại
4. ✅ Xác thực thông tin thẻ real-time

### Manual Testing
1. Thêm sản phẩm vào giỏ hàng
2. Chọn "Thanh toán bằng thẻ Visa/Mastercard"
3. Sử dụng test card: 4242 4242 4242 4242
4. Xác nhận thanh toán thành công

## Notes

- Stripe Elements tự động validate thông tin thẻ
- UI responsive và user-friendly
- Error handling đầy đủ cho các trường hợp
- Toast notifications cho feedback người dùng
- Integration hoàn chỉnh với flow hiện tại

## Support

Nếu có vấn đề với tích hợp Stripe, kiểm tra:
1. Network connectivity
2. API keys configuration  
3. Browser console logs
4. Backend application logs 