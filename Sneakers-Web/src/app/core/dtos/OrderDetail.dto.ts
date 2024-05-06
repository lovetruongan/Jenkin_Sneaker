import { ProductDto } from "./product.dto";

export interface OrderDetailDto {
    id: number,
    numberOfProducts: number,
    price: number,
    product: ProductDto,
    size: number,
    totalMoney: number
}