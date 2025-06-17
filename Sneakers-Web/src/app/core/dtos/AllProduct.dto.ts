import { ProductDto } from "./product.dto";

export interface AllProductDto {
    products: ProductDto[], 
    totalProducts : number,
}