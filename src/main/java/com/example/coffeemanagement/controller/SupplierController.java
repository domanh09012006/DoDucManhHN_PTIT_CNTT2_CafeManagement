package com.example.coffeemanagement.controller;

import com.example.coffeemanagement.dto.request.SupplierRequest;
import com.example.coffeemanagement.dto.response.ApiResponse;
import com.example.coffeemanagement.dto.response.SupplierResponse;
import com.example.coffeemanagement.service.SupplierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
@Tag(name = "Supplier Management", description = "API quản lý nhà cung cấp")
public class SupplierController {

    private final SupplierService supplierService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Thêm nhà cung cấp mới")
    public ResponseEntity<ApiResponse<SupplierResponse>> createSupplier(@Valid @RequestBody SupplierRequest request) {
        SupplierResponse response = supplierService.createSupplier(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thêm nhà cung cấp thành công", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Cập nhật nhà cung cấp")
    public ResponseEntity<ApiResponse<SupplierResponse>> updateSupplier(
            @PathVariable Long id,
            @Valid @RequestBody SupplierRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công", supplierService.updateSupplier(id, request)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy nhà cung cấp theo ID")
    public ResponseEntity<ApiResponse<SupplierResponse>> getSupplierById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Thành công", supplierService.getSupplierById(id)));
    }

    @GetMapping
    @Operation(summary = "Tìm kiếm nhà cung cấp")
    public ResponseEntity<ApiResponse<Page<SupplierResponse>>> searchSuppliers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return ResponseEntity.ok(ApiResponse.success("Thành công", supplierService.searchSuppliers(keyword, active, pageable)));
    }

    @GetMapping("/active")
    @Operation(summary = "Danh sách nhà cung cấp đang hoạt động")
    public ResponseEntity<ApiResponse<List<SupplierResponse>>> getActiveSuppliers() {
        return ResponseEntity.ok(ApiResponse.success("Thành công", supplierService.getActiveSuppliers()));
    }

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Bật/tắt nhà cung cấp")
    public ResponseEntity<ApiResponse<Void>> toggleActive(@PathVariable Long id) {
        supplierService.toggleActive(id);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Vô hiệu hoá nhà cung cấp")
    public ResponseEntity<ApiResponse<Void>> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok(ApiResponse.success("Xoá nhà cung cấp thành công"));
    }
}
