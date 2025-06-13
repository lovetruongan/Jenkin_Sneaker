export interface ProductDto {
    id: number,
    name : string,
    price : number,
    thumbnail : string,
    description: string,
    discount: number,
    quantity: number,
    category_id: number | null,
    brand: string,
    product_images: {
        id: number;
        image_url: string;
    }[],
}