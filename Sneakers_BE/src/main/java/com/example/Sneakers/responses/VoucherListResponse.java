package com.example.Sneakers.responses;

import lombok.*;

import java.util.List;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VoucherListResponse {
    private List<VoucherResponse> vouchers;
    private int totalPages;
}