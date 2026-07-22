package com.example.coffeemanagement.service.impl;

import com.example.coffeemanagement.dto.request.SupplierRequest;
import com.example.coffeemanagement.dto.response.SupplierResponse;
import com.example.coffeemanagement.entity.Supplier;
import com.example.coffeemanagement.exception.DuplicateResourceException;
import com.example.coffeemanagement.exception.ResourceNotFoundException;
import com.example.coffeemanagement.repository.SupplierRepository;
import com.example.coffeemanagement.service.SupplierService;
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
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;

    @Override
    public SupplierResponse createSupplier(SupplierRequest request) {
        if (supplierRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Nhà cung cấp '" + request.getName() + "' đã tồn tại");
        }
        if (request.getPhone() != null && supplierRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Số điện thoại '" + request.getPhone() + "' đã được sử dụng");
        }
        Supplier supplier = Supplier.builder()
                .name(request.getName())
                .contactPerson(request.getContactPerson())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .taxCode(request.getTaxCode())
                .notes(request.getNotes())
                .active(true)
                .build();
        Supplier saved = supplierRepository.save(supplier);
        log.info("Supplier created: {}", saved.getName());
        return toResponse(saved);
    }

    @Override
    public SupplierResponse updateSupplier(Long id, SupplierRequest request) {
        Supplier supplier = findById(id);
        if (!supplier.getName().equals(request.getName()) && supplierRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Nhà cung cấp '" + request.getName() + "' đã tồn tại");
        }
        supplier.setName(request.getName());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setPhone(request.getPhone());
        supplier.setEmail(request.getEmail());
        supplier.setAddress(request.getAddress());
        supplier.setTaxCode(request.getTaxCode());
        supplier.setNotes(request.getNotes());
        return toResponse(supplierRepository.save(supplier));
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierResponse getSupplierById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SupplierResponse> searchSuppliers(String keyword, Boolean active, Pageable pageable) {
        return supplierRepository.searchSuppliers(keyword, active, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierResponse> getActiveSuppliers() {
        return supplierRepository.findByActiveTrue().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public void toggleActive(Long id) {
        Supplier supplier = findById(id);
        supplier.setActive(!supplier.isActive());
        supplierRepository.save(supplier);
    }

    @Override
    public void deleteSupplier(Long id) {
        Supplier supplier = findById(id);
        supplier.setActive(false);
        supplierRepository.save(supplier);
        log.info("Supplier {} deactivated", supplier.getName());
    }

    private Supplier findById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhà cung cấp với ID: " + id));
    }

    private SupplierResponse toResponse(Supplier supplier) {
        return SupplierResponse.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .contactPerson(supplier.getContactPerson())
                .phone(supplier.getPhone())
                .email(supplier.getEmail())
                .address(supplier.getAddress())
                .taxCode(supplier.getTaxCode())
                .notes(supplier.getNotes())
                .active(supplier.isActive())
                .createdAt(supplier.getCreatedAt())
                .updatedAt(supplier.getUpdatedAt())
                .build();
    }
}
