export interface ProductDto {
    id: number,
    name : string,
    price : number,
    thumbnail : string,
    description: string,
    discount: number,
    category_id: number | null,
    product_images: {
        id: number;
        image_url: string;
    }[],
}