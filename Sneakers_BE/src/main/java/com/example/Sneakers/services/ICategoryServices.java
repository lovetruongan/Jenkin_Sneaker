package com.example.Sneakers.services;

import com.example.Sneakers.dtos.CategoryDTO;
import com.example.Sneakers.models.Category;

import java.util.List;

public interface ICategoryServices {
    Category createCategory(CategoryDTO categoryDTO) throws Exception;
    Category getCategoryById(long id);
    List<Category> getAllCategories();
    Category updateCategory(long categoryId, CategoryDTO categoryDTO);
    void deleteCategory(long id);
}