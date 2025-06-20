package com.example.Sneakers.responses;

import lombok.*;

import java.util.List;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class HomepageVoucherListResponse {
    private List<HomepageVoucherResponse> vouchers;
    private int totalPages;
    private String message;
} 