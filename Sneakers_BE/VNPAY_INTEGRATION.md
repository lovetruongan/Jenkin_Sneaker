# VNPay Payment Integration Guide

## Overview

This guide explains how to use the VNPay payment integration in the Sneakers application.

## Configuration

### Environment Variables

Add the following to your environment variables or `.env` file:

```
VNPAY_TMN_CODE=your_vnpay_terminal_code
VNPAY_SECRET_KEY=your_vnpay_secret_key
```

### Application Configuration

The VNPay configuration is already set in `application.yaml`:

```yaml
vnpay:
  url: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
  return-url: http://localhost:8089/api/v1/payments/vnpay-return
  tmn-code: ${VNPAY_TMN_CODE:}
  secret-key: ${VNPAY_SECRET_KEY:}
  api-url: https://sandbox.vnpayment.vn/merchant_webapi/api/transaction
  version: 2.1.0
```

## API Endpoints

### 1. Create Payment

**POST** `/api/v1/payments/create-payment`

Request Body:

```json
{
  "amount": 100000,
  "bankCode": "VNBANK",
  "language": "vn",
  "orderInfo": "Payment for order #12345",
  "orderId": 1
}
```

Response:

```json
{
  "code": "00",
  "message": "success",
  "data": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=10000000&vnp_Command=pay..."
}
```

### 2. Query Transaction

**POST** `/api/v1/payments/query`

Request Body:

```json
{
  "txnRef": "12345678",
  "transDate": "20240101120000"
}
```

### 3. Refund Transaction  

**POST** `/api/v1/payments/refund`

Request Body:

```json
{
  "transactionType": "02",
  "txnRef": "12345678",
  "amount": 50000,
  "transDate": "20240101120000",
  "user": "admin@example.com",
  "transactionNo": "vnp_transaction_number"
}
```

### 4. VNPay Return URL

**GET** `/api/v1/payments/vnpay-return`

This endpoint is called by VNPay after payment processing. It validates the response and updates the payment status.

## Database Schema

### Payment Table

The payment information is stored in the `payments` table with the following fields:

- `id`: Primary key
- `order_id`: Foreign key to orders table
- `vnp_txn_ref`: VNPay transaction reference
- `vnp_amount`: Payment amount
- `payment_status`: PENDING, SUCCESS, FAILED, REFUNDED, PARTIALLY_REFUNDED
- `vnp_response_code`: VNPay response code
- And other VNPay response fields

## Payment Flow

1. **Create Order**: Create an order in your system
2. **Initiate Payment**: Call `/api/v1/payments/create-payment` with order details
3. **Redirect User**: Redirect user to the VNPay payment URL returned in response
4. **User Completes Payment**: User completes payment on VNPay's page
5. **VNPay Callback**: VNPay redirects back to your return URL
6. **Update Status**: System validates the response and updates payment/order status

## Response Codes

Common VNPay response codes:

- `00`: Success
- `07`: Suspicious transaction (SMS OTP)
- `09`: Transaction failed - Invalid card/account
- `10`: Transaction failed - Incorrect card/account info 3 times
- `11`: Transaction failed - Payment deadline expired
- `12`: Transaction failed - Card/Account locked
- `13`: Transaction failed - Incorrect OTP
- `24`: Transaction canceled

## Testing

For sandbox testing:

- Use test card numbers provided by VNPay
- All amounts should be in VND (multiply by 100 for VNPay)
- Minimum amount: 1,000 VND

## Security Notes

1. Always validate the secure hash from VNPay responses
2. Store sensitive configuration in environment variables
3. Use HTTPS in production
4. Implement proper error handling and logging
5. Consider implementing idempotency for payment creation
