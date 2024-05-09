export interface ProductDto {
    id: number,
    name : string,
    price : number,
    thumbnail : string,
    description: string,
    discount: number,
    category_id: number,
    product_images: {
        id: number;
        imageUrl: string;
    }[],
}