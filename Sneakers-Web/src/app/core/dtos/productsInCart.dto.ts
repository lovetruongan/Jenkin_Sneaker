import { ProductDto } from "./product.dto";

export interface ProductsInCartDto {
    id: number,
    products: ProductDto,
    quantity: number,
    size: number
}