export const environment = {
    production: false,
    apiUrl: 'http://localhost:8089/api/v1/',
    apiImage: 'http://localhost:8089/api/v1/products/images/',
    payment: {
        vnpay: {
        returnUrl: 'http://localhost:4200/payment/result',
        cancelUrl: 'http://localhost:4200/payment/cancel'
        },
        momo: {
        returnUrl: 'http://localhost:4200/payment/result',
        cancelUrl: 'http://localhost:4200/payment/cancel'
        }
    }
};
