#!/bin/bash

# Test creating an order with a voucher

TOKEN="eyJhbGciOiJIUzI1NiJ9.eyJwaG9uZU51bWJlciI6IjA4NjUyNDcyMzQiLCJ1c2VySWQiOjE0LCJzdWIiOiIwODY1MjQ3MjM0IiwiZXhwIjoxNzUwNzAyODAyfQ.aCZmkaEfidcbcxG6xW_otncWMkxfs-CFr8L1-M7djGo"

# First test the voucher apply endpoint
echo "Testing voucher WELCOME10..."
curl -v -X POST "http://localhost:8089/api/v1/vouchers/apply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "voucher_code": "WELCOME10",
    "order_total": 3000000
  }'

echo -e "\n\nCreating order with voucher..."

# Create order with voucher
curl -v -X POST "http://localhost:8089/api/v1/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fullname": "Test Voucher",
    "email": "test@example.com",
    "phone_number": "0123456789",
    "address": "Test Address",
    "note": "Test with WELCOME10 voucher",
    "shipping_method": "Tiêu chuẩn",
    "payment_method": "Thanh toán khi nhận hàng",
    "total_money": 3000000,
    "voucher_code": "WELCOME10",
    "cart_items": [
      {
        "product_id": 1,
        "quantity": 1,
        "size": 43
      }
    ]
  }' 