package com.example.Sneakers.repositories;

import com.example.Sneakers.models.Category;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CategoryRepository extends JpaRepository<Category,Long>{
    boolean existsByName(String name);
}