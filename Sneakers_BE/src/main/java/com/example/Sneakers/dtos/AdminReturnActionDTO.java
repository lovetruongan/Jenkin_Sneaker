package com.example.Sneakers.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminReturnActionDTO {
    @JsonProperty("admin_notes")
    @NotBlank(message = "Admin notes are required for this action")
    @Size(max = 1000, message = "Admin notes cannot exceed 1000 characters")
    private String adminNotes;
}