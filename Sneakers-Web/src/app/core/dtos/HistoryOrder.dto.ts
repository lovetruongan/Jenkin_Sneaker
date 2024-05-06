export interface HistoryOrderDto {
    id: number,
    status: string,
    thumbnail: string,
    total_money: number,
    total_products: number
    product_name: string,
    order_date: Date,
}