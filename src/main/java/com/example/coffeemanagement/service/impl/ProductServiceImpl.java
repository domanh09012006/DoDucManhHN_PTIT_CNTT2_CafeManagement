package com.example.coffeemanagement.service.impl;

import com.example.coffeemanagement.dto.request.ProductRequest;
import com.example.coffeemanagement.dto.response.ProductResponse;
import com.example.coffeemanagement.entity.Category;
import com.example.coffeemanagement.entity.Product;
import com.example.coffeemanagement.enums.ProductStatus;
import com.example.coffeemanagement.exception.ResourceNotFoundException;
import com.example.coffeemanagement.repository.CategoryRepository;
import com.example.coffeemanagement.repository.ProductRepository;
import com.example.coffeemanagement.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public ProductResponse createProduct(ProductRequest request) {
        Category category = findCategoryById(request.getCategoryId());

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .costPrice(request.getCostPrice())
                .category(category)
                .imageUrl(request.getImageUrl())
                .featured(request.isFeatured())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .status(ProductStatus.AVAILABLE)
                .build();

        Product saved = productRepository.save(product);
        log.info("Product created: {} (ID: {})", saved.getName(), saved.getId());
        return toResponse(saved);
    }

    @Override
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = findById(id);
        Category category = findCategoryById(request.getCategoryId());

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCostPrice(request.getCostPrice());
        product.setCategory(category);
        product.setImageUrl(request.getImageUrl());
        product.setFeatured(request.isFeatured());
        if (request.getDisplayOrder() != null) {
            product.setDisplayOrder(request.getDisplayOrder());
        }

        Product saved = productRepository.save(product);
        log.info("Product updated: {} (ID: {})", saved.getName(), saved.getId());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(String keyword, Long categoryId, ProductStatus status, Pageable pageable) {
        return productRepository.searchProducts(keyword, categoryId, status, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findByFeaturedTrue()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAvailableProducts() {
        return productRepository.findByStatus(ProductStatus.AVAILABLE)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByCategory(Long categoryId) {
        findCategoryById(categoryId); // validate exists
        return productRepository.findByCategoryId(categoryId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public void updateStatus(Long id, ProductStatus status) {
        Product product = findById(id);
        product.setStatus(status);
        productRepository.save(product);
        log.info("Product {} status updated to {}", product.getName(), status);
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = findById(id);
        product.setStatus(ProductStatus.DISCONTINUED);
        productRepository.save(product);
        log.info("Product {} marked as DISCONTINUED", product.getName());
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));
    }

    private Category findCategoryById(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + categoryId));
    }

    private ProductResponse toResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .costPrice(product.getCostPrice())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .status(product.getStatus())
                .imageUrl(product.getImageUrl())
                .featured(product.isFeatured())
                .displayOrder(product.getDisplayOrder())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
