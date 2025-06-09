import { HistoryOrderDto } from "../dtos/HistoryOrder.dto";

export interface OrderListResponse {
    orders: HistoryOrderDto[];
    totalPages: number;
} 