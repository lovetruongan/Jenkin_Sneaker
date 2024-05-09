package com.example.Sneakers.dtos;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleDTO {
    @NotEmpty(message = "Role Id cannot be empty.")
    private Long roleId;
}