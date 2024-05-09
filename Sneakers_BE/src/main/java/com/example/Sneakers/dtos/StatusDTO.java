package com.example.Sneakers.dtos;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StatusDTO {
    @NotEmpty(message = "Status cannot be empty")
    private String status;
}