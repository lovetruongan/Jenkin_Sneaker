# VNPay Frontend Integration Guide

## Overview

This document describes the VNPay payment integration implementation in the Angular frontend application.

## Components Created

### 1. VNPay Service (`vnpay.service.ts`)

- **Location**: `src/app/core/services/vnpay.service.ts`
- **Purpose**: Handles all VNPay API communications
- **Key Methods**:
  - `createPayment()` - Creates VNPay payment URL
  - `queryTransaction()` - Queries transaction status
  - `refundTransaction()` - Processes refunds
  - `handleReturn()` - Handles VNPay return callbacks
  - `redirectToPayment()` - Redirects to VNPay payment page

### 2. VNPay Return Component (`vnpay-return.component.ts`)

- **Location**: `src/app/features/components/vnpay-return/vnpay-return.component.ts`
- **Purpose**: Handles payment return from VNPay
- **Features**:
  - Payment result validation
  - Payment status display
  - Navigation to order details or home
  - Error handling

### 3. Updated Order Component

- **Location**: `src/app/features/components/order/order.component.ts`
- **Updates**:
  - Added VNPay payment option
  - Added bank selection for VNPay
  - Integrated VNPay payment flow
  - Added payment redirection logic

## Payment Flow

### 1. User Selects VNPay Payment

```typescript
// User selects VNPay payment method
selectedPayMethod = { name: 'Thanh toán VNPay', key: 'VNPay' }

// User selects preferred bank
selectedBankCode = 'NCB' // Default or user choice
```

### 2. Order Creation and Payment Processing

```typescript
// 1. Create order in system
this.orderService.postOrder(orderData)

// 2. Create VNPay payment URL
this.vnpayService.createPayment({
  amount: finalAmount,
  bankCode: this.selectedBankCode,
  language: 'vn',
  orderInfo: `Thanh toan don hang #${this.orderId}`,
  orderId: this.orderId
})

// 3. Redirect to VNPay
this.vnpayService.redirectToPayment(paymentUrl)
```

### 3. VNPay Return Processing

```typescript
// VNPay redirects to: /vnpay-return?vnp_params...
// Component processes return parameters
this.vnpayService.handleReturn(params)

// Validate payment and update UI
if (isValid && isSuccessful) {
  // Show success message
  // Navigate to order details
} else {
  // Show error message
  // Allow retry or navigation
}
```

## Available Bank Options

The system supports the following banks:

- NCB (Default)
- Agribank
- SCB
- Sacombank
- Eximbank
- MSBANK
- NAMABANK
- Visa
- Mastercard
- JCB
- UPI
- VIB
- Vietcombank
- Vietinbank
- Techcombank
- TPBANK
- BIDV
- DONGABANK
- BAOVIBANK
- HDBANK

## Payment Methods

The order page now supports three payment methods:

1. **Cash on Delivery** (`Cash`)
2. **Bank Transfer** (`Banking`)
3. **VNPay Online Payment** (`VNPay`) - **NEW**

## UI Components

### Bank Selection Dropdown

When VNPay is selected, a bank selection dropdown appears:

```html
@if (item.key === 'VNPay' && selectedPayMethod?.key === 'VNPay') {
    <div class="bank-selection mt-2">
        <label class="font-bold">Chọn ngân hàng:</label>
        <p-dropdown 
            [options]="bankOptions" 
            [(ngModel)]="selectedBankCode" 
            optionLabel="name" 
            optionValue="code"
            placeholder="Chọn ngân hàng">
        </p-dropdown>
    </div>
}
```

### Payment Result Display

The VNPay return component shows:

- Payment status (success/failure)
- Transaction reference
- Amount paid
- Bank used
- Payment date/time
- Action buttons (home, view order)

## Error Handling

### Payment Creation Errors

- Network errors
- Invalid order data
- VNPay API errors
- Validation failures

### Payment Return Errors

- Invalid signature
- Missing parameters
- Payment failures
- Network timeouts

### User Experience

- Loading indicators during payment creation
- Success/error toast messages
- Graceful error recovery
- Clear payment status communication

## Configuration

### Environment Settings

```typescript
// environment.ts
export const environment = {
    production: false,
    apiUrl: 'http://localhost:8089/api/v1'
};
```

### VNPay Service Configuration

- Base URL: `${environment.apiUrl}/payments`
- Supported languages: Vietnamese (`vn`)
- Default bank: NCB
- Return URL: `/vnpay-return`

## Testing

### Test Payment Flow

1. Add products to cart
2. Go to checkout
3. Fill shipping information
4. Select "Thanh toán VNPay"
5. Choose bank from dropdown
6. Click "Đặt hàng"
7. Get redirected to VNPay sandbox
8. Complete test payment
9. Return to application
10. Verify payment result

### Test Data

- Use VNPay sandbox environment
- Test with various bank codes
- Test both successful and failed payments
- Test invalid return scenarios

## Security Features

1. **Signature Validation**: All VNPay responses are validated using secure hash
2. **Parameter Sanitization**: Input validation on all payment parameters
3. **HTTPS Enforcement**: All payment communications use HTTPS
4. **Error Masking**: Sensitive error details are hidden from users
5. **Timeout Handling**: Payment sessions have defined timeouts

## Future Enhancements

1. **Payment History**: Track and display payment history
2. **Partial Refunds**: Implement partial refund functionality  
3. **Multiple Payment Methods**: Support multiple payment methods per order
4. **Saved Payment Methods**: Allow users to save preferred banks
5. **Payment Analytics**: Add payment success/failure tracking
6. **Mobile Optimization**: Enhance mobile payment experience
7. **Offline Support**: Handle offline scenarios gracefully

## Troubleshooting

### Common Issues

1. **Empty Hash Error**: Check backend VNPay configuration
2. **Redirect Fails**: Verify return URL configuration
3. **Invalid Signature**: Check secret key matching
4. **Payment Timeout**: Verify VNPay sandbox access
5. **Bank Selection**: Ensure bank codes are correct

### Debug Steps

1. Check browser console for errors
2. Verify network requests in DevTools
3. Check backend logs for VNPay errors
4. Test with different banks/amounts
5. Verify environment configuration
