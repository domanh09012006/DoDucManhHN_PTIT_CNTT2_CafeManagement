package com.example.coffeemanagement.service;

import com.example.coffeemanagement.dto.request.CategoryRequest;
import com.example.coffeemanagement.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse updateCategory(Long id, CategoryRequest request);

    CategoryResponse getCategoryById(Long id);

    List<CategoryResponse> getAllCategories();

    List<CategoryResponse> getActiveCategories();

    void toggleActive(Long id);

    void deleteCategory(Long id);
}
