package com.example.Sneakers.controllers;

import com.example.Sneakers.components.LocalizationUtils;
import com.example.Sneakers.dtos.CategoryDTO;
import com.example.Sneakers.models.Category;
import com.example.Sneakers.responses.CategoryResponse;
import com.example.Sneakers.responses.UpdateCategoryResponse;
import com.example.Sneakers.services.CategoryService;
import com.example.Sneakers.utils.MessageKeys;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("${api.prefix}/categories")
@RestController
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;
    private final LocalizationUtils localizationUtils;

    @PostMapping("")
    public ResponseEntity<?> createCategory(
            @RequestBody CategoryDTO categoryDTO,
            @RequestHeader("Authorization") String token
    ){
        try{
            Category category = categoryService.createCategory(categoryDTO);
            return ResponseEntity.ok(CategoryResponse
                    .builder()
                            .categories(categoryService.getAllCategories())
                            .message("Create category successfully!")
                    .build());
        }
        catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("")
    public ResponseEntity<?> getAllCategories(

//        @RequestParam("page") int page,
//        @RequestParam("limit") int limit
    ){
        List<Category> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryById(
        @PathVariable("id") Long id
    ){
        Category category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(category);
    }
    @PutMapping("/{id}")
    public ResponseEntity<UpdateCategoryResponse> updateCategory(
            @Valid @PathVariable("id") Long id,
            @Valid @RequestBody CategoryDTO categoryDTO,
            @RequestHeader("Authorization") String token
    ){
        UpdateCategoryResponse updateCategoryResponse = new UpdateCategoryResponse();
        categoryService.updateCategory(id, categoryDTO);
        updateCategoryResponse.setMessage(localizationUtils.getLocalizedMessage(MessageKeys.UPDATE_CATEGORY_SUCCESSFULLY));
        return ResponseEntity.ok(updateCategoryResponse);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(
            @Valid @PathVariable("id") Long id,
            @RequestHeader("Authorization") String token
    ){
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(localizationUtils.getLocalizedMessage(MessageKeys.DELETE_CATEGORY_SUCCESSFULLY));
    }
}