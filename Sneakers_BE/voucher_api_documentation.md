# Voucher Service API Documentation

## Base URL

`${api.prefix}/vouchers`

## Endpoints

### 1. Create Voucher (Admin Only)

**POST** `/vouchers`

**Request Body:**

```json
{
  "code": "SALE66",
  "name": "Sale 6/6",
  "description": "Giảm giá nhân dịp 6/6",
  "discount_percentage": 20,
  "min_order_value": 500000,
  "max_discount_amount": 100000,
  "quantity": 100,
  "valid_from": "2024-06-01T00:00:00",
  "valid_to": "2024-06-30T23:59:59",
  "is_active": true
}
```

**Success Response (200 OK):**

```json
{
  "id": 1,
  "code": "SALE66",
  "name": "Sale 6/6",
  "description": "Giảm giá nhân dịp 6/6",
  "discount_percentage": 20,
  "min_order_value": 500000,
  "max_discount_amount": 100000,
  "quantity": 100,
  "remaining_quantity": 100,
  "valid_from": "2024-06-01T00:00:00",
  "valid_to": "2024-06-30T23:59:59",
  "is_active": true,
  "is_valid": true,
  "created_at": "2024-01-01T10:00:00",
  "updated_at": "2024-01-01T10:00:00"
}
```

**Error Responses:**

- **400 Bad Request**: "Thiếu thông tin cần thiết" (Missing required fields)
- **400 Bad Request**: "Mã voucher bị trùng" (Voucher code already exists)

### 2. Get All Vouchers

**GET** `/vouchers?page=0&limit=10&filter=active`

**Query Parameters:**

- `page`: Page number (default: 0)
- `limit`: Items per page (default: 10)
- `filter`: Filter type - `active`, `valid`, or `all` (default: active)

**Success Response (200 OK):**

```json
{
  "vouchers": [
    {
      "id": 1,
      "code": "SALE66",
      "name": "Sale 6/6",
      "discount_percentage": 20,
      "remaining_quantity": 95,
      "is_valid": true,
      // ... other fields
    }
  ],
  "totalPages": 5
}
```

**No Vouchers Response (200 OK):**

```json
{
  "message": "Không có voucher"
}
```

### 3. Get Voucher by ID

**GET** `/vouchers/{id}`

**Success Response (200 OK):** Returns voucher details

### 4. Get Voucher by Code

**GET** `/vouchers/code/{code}`

**Success Response (200 OK):** Returns voucher details

### 5. Search Vouchers

**GET** `/vouchers/search?keyword=sale&page=0&limit=10`

**Query Parameters:**

- `keyword`: Search keyword for code or name
- `page`: Page number (default: 0)
- `limit`: Items per page (default: 10)

### 6. Update Voucher (Admin Only)

**PUT** `/vouchers/{id}`

**Request Body:** Same as create voucher

**Success Response (200 OK):** Returns updated voucher

**Error Response:**

- **400 Bad Request**: "Mã voucher bị trùng" (Voucher code already exists)

### 7. Delete Voucher (Admin Only)

**DELETE** `/vouchers/{id}`

**Success Response (200 OK):**

```json
{
  "message": "Xóa voucher thành công"
}
```

**Error Response:**

- **400 Bad Request**: "Không thể xóa voucher đang được sử dụng trong đơn hàng"

### 8. Apply Voucher

**POST** `/vouchers/apply`

**Request Body:**

```json
{
  "voucher_code": "SALE66",
  "order_total": 1000000
}
```

**Success Response (200 OK):**

```json
{
  "voucher_code": "SALE66",
  "voucher_name": "Sale 6/6",
  "discount_percentage": 20,
  "discount_amount": 100000,
  "original_total": 1000000,
  "final_total": 900000,
  "is_applied": true,
  "message": "Áp dụng voucher thành công"
}
```

**Error Response (400 Bad Request):**

```json
{
  "voucher_code": "SALE66",
  "original_total": 100000,
  "final_total": 100000,
  "is_applied": false,
  "message": "Đơn hàng chưa đạt giá trị tối thiểu 500000"
}
```

## Using Voucher in Order Creation

When creating an order, include the `voucher_code` in the order DTO:

**POST** `/orders`

```json
{
  "user_id": 1,
  "fullname": "Nguyen Van A",
  "phone_number": "0123456789",
  "address": "123 ABC Street",
  "total_money": 1000000,
  "voucher_code": "SALE66",
  "cart_items": [
    {
      "product_id": 1,
      "quantity": 2,
      "size": 42
    }
  ]
}
```

## Authorization

- Admin endpoints require `ROLE_ADMIN` authorization
- Regular endpoints are accessible to all authenticated users
