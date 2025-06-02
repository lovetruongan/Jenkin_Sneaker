export interface VoucherDto {
  id?: number;
  code: string;
  name: string;
  description?: string;
  discount_percentage: number;
  min_order_value?: number;
  max_discount_amount?: number;
  quantity: number;
  remaining_quantity?: number;
  valid_from: string;
  valid_to: string;
  is_active?: boolean;
  is_valid?: boolean;
  created_at?: string;
  updated_at?: string;
} 