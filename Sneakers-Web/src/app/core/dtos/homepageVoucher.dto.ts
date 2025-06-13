export interface HomepageVoucherDto {
  id: number;
  code: string;
  name: string;
  description: string;
  discount_percentage: number;
  min_order_value: number;
  max_discount_amount?: number;
  remaining_quantity: number;
  valid_to: string;
  expiration_date_formatted: string;
  days_remaining: number;
  is_expiring_soon: boolean;
  status_message: string;
}

export interface HomepageVoucherListDto {
  vouchers: HomepageVoucherDto[];
  totalPages: number;
  message: string;
} 