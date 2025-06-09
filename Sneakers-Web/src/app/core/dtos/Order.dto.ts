import { ProductToCartDto } from "./productToCart.dto";

export interface OrderDto {
    id?: number;
    fullname: string,
    email: string,
    phone_number: string,
    address: string,
    note: string,
    shipping_method: string,
    payment_method: string,
    total_money: number,
    cart_items: ProductToCartDto[];
    voucher_code?: string;
}