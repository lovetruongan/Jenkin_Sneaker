import { ProductDto } from "./product.dto";

export interface OrderDetailDto {
    id: number,
    number_of_products: number,
    price: number,
    product?: ProductDto,
    size: number,
    total_money: number
}