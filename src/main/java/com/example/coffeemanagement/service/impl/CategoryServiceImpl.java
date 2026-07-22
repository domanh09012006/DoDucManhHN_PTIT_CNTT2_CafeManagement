package com.example.coffeemanagement.service.impl;

import com.example.coffeemanagement.dto.request.CategoryRequest;
import com.example.coffeemanagement.dto.response.CategoryResponse;
import com.example.coffeemanagement.entity.Category;
import com.example.coffeemanagement.exception.DuplicateResourceException;
import com.example.coffeemanagement.exception.ResourceNotFoundException;
import com.example.coffeemanagement.repository.CategoryRepository;
import com.example.coffeemanagement.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Danh mục '" + request.getName() + "' đã tồn tại");
        }
        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .active(request.isActive())
                .build();
        Category saved = categoryRepository.save(category);
        log.info("Category created: {}", saved.getName());
        return toResponse(saved);
    }

    @Override
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = findById(id);
        if (!category.getName().equals(request.getName()) && categoryRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Danh mục '" + request.getName() + "' đã tồn tại");
        }
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        if (request.getDisplayOrder() != null) {
            category.setDisplayOrder(request.getDisplayOrder());
        }
        category.setActive(request.isActive());
        Category saved = categoryRepository.save(category);
        log.info("Category updated: {}", saved.getName());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAllByOrderByDisplayOrderAsc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findByActiveTrue()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public void toggleActive(Long id) {
        Category category = findById(id);
        category.setActive(!category.isActive());
        categoryRepository.save(category);
        log.info("Category {} active toggled to {}", category.getName(), category.isActive());
    }

    @Override
    public void deleteCategory(Long id) {
        Category category = findById(id);
        if (!category.getProducts().isEmpty()) {
            throw new IllegalArgumentException(
                    "Không thể xoá danh mục '" + category.getName() + "' vì đang có " +
                    category.getProducts().size() + " sản phẩm");
        }
        categoryRepository.delete(category);
        log.info("Category deleted: {}", category.getName());
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + id));
    }

    private CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .displayOrder(category.getDisplayOrder())
                .active(category.isActive())
                .productCount(category.getProducts() != null ? category.getProducts().size() : 0)
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}
