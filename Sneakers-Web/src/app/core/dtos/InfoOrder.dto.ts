import { OrderDetailDto } from "./OrderDetail.dto";

export interface InfoOrderDto {
    id: number,
    fullname: string,
    email: string,
    phone_number: string,
    address: string,
    note: string,
    shipping_method: string,
    payment_method: string,
    order_date: Date,
    status: string,
    order_details: OrderDetailDto[],
    total_money?: number,
    voucher?: {
        code: string,
        name: string,
        discount_percentage: number
    },
    discount_amount?: number
}