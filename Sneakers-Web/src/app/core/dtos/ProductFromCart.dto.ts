import { ProductDto } from "./product.dto";
import { ProductsInCartDto } from "./productsInCart.dto";

export interface ProductFromCartDto {
    carts: [ProductsInCartDto],
    totalCartItems: number
}