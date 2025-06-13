export interface OrderHistoryResponse {
  id: number;
  buyer_name: string;
  order_date: string;
  total_money: number;
  status: string;
  product_name: string;
  thumbnail: string;
  total_products: number;
  payment_method: string;
} 