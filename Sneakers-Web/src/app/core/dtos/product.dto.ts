export interface ProductDto {
    id: number,
    name : string,
    price : number,
    thumbnail : string,
    description: string,
    discount: number,
    product_images: {
        id: number;
        imageUrl: string;
    }[],
}