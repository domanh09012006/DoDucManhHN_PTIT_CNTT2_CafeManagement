package com.example.coffeemanagement.service;

import com.example.coffeemanagement.dto.request.ProductRequest;
import com.example.coffeemanagement.dto.response.ProductResponse;
import com.example.coffeemanagement.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {

    ProductResponse createProduct(ProductRequest request);

    ProductResponse updateProduct(Long id, ProductRequest request);

    ProductResponse getProductById(Long id);

    Page<ProductResponse> searchProducts(String keyword, Long categoryId, ProductStatus status, Pageable pageable);

    List<ProductResponse> getFeaturedProducts();

    List<ProductResponse> getAvailableProducts();

    List<ProductResponse> getProductsByCategory(Long categoryId);

    void updateStatus(Long id, ProductStatus status);

    void deleteProduct(Long id);
}
