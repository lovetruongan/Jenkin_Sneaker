export interface ApplyVoucherDto {
  voucher_code: string;
  order_total: number;
}

export interface VoucherApplicationResponseDto {
  voucher_code: string;
  voucher_name?: string;
  discount_percentage?: number;
  discount_amount?: number;
  original_total: number;
  final_total: number;
  is_applied: boolean;
  message: string;
} 