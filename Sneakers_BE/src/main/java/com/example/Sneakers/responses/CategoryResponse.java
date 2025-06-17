package com.example.Sneakers.responses;

import com.example.Sneakers.models.Category;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.github.javafaker.Cat;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CategoryResponse {
    @JsonProperty("message")
    private String message;

    @JsonProperty("categories")
    private List<Category> categories;
}