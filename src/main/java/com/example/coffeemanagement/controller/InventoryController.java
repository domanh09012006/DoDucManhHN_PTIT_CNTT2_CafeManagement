package com.example.coffeemanagement.controller;

import com.example.coffeemanagement.dto.request.IngredientRequest;
import com.example.coffeemanagement.dto.request.InventoryTransactionRequest;
import com.example.coffeemanagement.dto.response.ApiResponse;
import com.example.coffeemanagement.dto.response.IngredientResponse;
import com.example.coffeemanagement.dto.response.InventoryTransactionResponse;
import com.example.coffeemanagement.entity.User;
import com.example.coffeemanagement.enums.TransactionType;
import com.example.coffeemanagement.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory Management", description = "API quản lý kho nguyên liệu")
public class InventoryController {

    private final InventoryService inventoryService;

    // ─── Ingredient endpoints ─────────────────────────────────────────────────

    @PostMapping("/ingredients")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Thêm nguyên liệu mới")
    public ResponseEntity<ApiResponse<IngredientResponse>> createIngredient(
            @Valid @RequestBody IngredientRequest request) {
        IngredientResponse response = inventoryService.createIngredient(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thêm nguyên liệu thành công", response));
    }

    @PutMapping("/ingredients/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Cập nhật nguyên liệu")
    public ResponseEntity<ApiResponse<IngredientResponse>> updateIngredient(
            @PathVariable Long id,
            @Valid @RequestBody IngredientRequest request) {
        IngredientResponse response = inventoryService.updateIngredient(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật nguyên liệu thành công", response));
    }

    @GetMapping("/ingredients/{id}")
    @Operation(summary = "Lấy nguyên liệu theo ID")
    public ResponseEntity<ApiResponse<IngredientResponse>> getIngredientById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Thành công", inventoryService.getIngredientById(id)));
    }

    @GetMapping("/ingredients")
    @Operation(summary = "Tìm kiếm nguyên liệu")
    public ResponseEntity<ApiResponse<Page<IngredientResponse>>> searchIngredients(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return ResponseEntity.ok(ApiResponse.success("Thành công",
                inventoryService.searchIngredients(keyword, active, pageable)));
    }

    @GetMapping("/ingredients/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Nguyên liệu sắp hết hàng")
    public ResponseEntity<ApiResponse<List<IngredientResponse>>> getLowStockIngredients() {
        return ResponseEntity.ok(ApiResponse.success("Thành công", inventoryService.getLowStockIngredients()));
    }

    @PatchMapping("/ingredients/{id}/toggle-active")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Bật/tắt nguyên liệu")
    public ResponseEntity<ApiResponse<Void>> toggleIngredientActive(@PathVariable Long id) {
        inventoryService.toggleIngredientActive(id);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công"));
    }

    // ─── Transaction endpoints ────────────────────────────────────────────────

    @PostMapping("/transactions")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Ghi nhận giao dịch kho (nhập/xuất/điều chỉnh)")
    public ResponseEntity<ApiResponse<InventoryTransactionResponse>> recordTransaction(
            @Valid @RequestBody InventoryTransactionRequest request,
            @AuthenticationPrincipal User currentUser) {
        InventoryTransactionResponse response = inventoryService.recordTransaction(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Ghi nhận giao dịch thành công", response));
    }

    @GetMapping("/transactions")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Tìm kiếm lịch sử giao dịch kho")
    public ResponseEntity<ApiResponse<Page<InventoryTransactionResponse>>> searchTransactions(
            @RequestParam(required = false) Long ingredientId,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success("Thành công",
                inventoryService.searchTransactions(ingredientId, type, from, to, pageable)));
    }

    @GetMapping("/ingredients/{id}/transactions")
    @Operation(summary = "Lịch sử giao dịch của nguyên liệu")
    public ResponseEntity<ApiResponse<List<InventoryTransactionResponse>>> getTransactionsByIngredient(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Thành công",
                inventoryService.getTransactionsByIngredient(id)));
    }
}
