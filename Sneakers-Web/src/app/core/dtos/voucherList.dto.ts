import { VoucherDto } from './voucher.dto';

export interface VoucherListDto {
  vouchers: VoucherDto[];
  totalPages: number;
} 