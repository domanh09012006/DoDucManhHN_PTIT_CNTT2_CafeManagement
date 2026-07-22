package com.example.coffeemanagement.service;

import com.example.coffeemanagement.dto.request.SupplierRequest;
import com.example.coffeemanagement.dto.response.SupplierResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SupplierService {

    SupplierResponse createSupplier(SupplierRequest request);

    SupplierResponse updateSupplier(Long id, SupplierRequest request);

    SupplierResponse getSupplierById(Long id);

    Page<SupplierResponse> searchSuppliers(String keyword, Boolean active, Pageable pageable);

    List<SupplierResponse> getActiveSuppliers();

    void toggleActive(Long id);

    void deleteSupplier(Long id);
}
