package com.example.coffeemanagement.controller;

import com.example.coffeemanagement.dto.request.OrderRequest;
import com.example.coffeemanagement.dto.response.ApiResponse;
import com.example.coffeemanagement.dto.response.OrderResponse;
import com.example.coffeemanagement.entity.User;
import com.example.coffeemanagement.enums.OrderStatus;
import com.example.coffeemanagement.service.OrderService;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Order Management", description = "API quản lý đơn hàng")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Tạo đơn hàng mới")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody OrderRequest request,
            @AuthenticationPrincipal User currentUser) {
        OrderResponse response = orderService.createOrder(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo đơn hàng thành công", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật đơn hàng")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrder(
            @PathVariable Long id,
            @Valid @RequestBody OrderRequest request) {
        OrderResponse response = orderService.updateOrder(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật đơn hàng thành công", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy đơn hàng theo ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Thành công", orderService.getOrderById(id)));
    }

    @GetMapping("/code/{orderCode}")
    @Operation(summary = "Lấy đơn hàng theo mã")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderByCode(@PathVariable String orderCode) {
        return ResponseEntity.ok(ApiResponse.success("Thành công", orderService.getOrderByCode(orderCode)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    @Operation(summary = "Tìm kiếm đơn hàng (phân trang)")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> searchOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) Long tableId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<OrderResponse> result = orderService.searchOrders(status, tableId, from, to, pageable);
        return ResponseEntity.ok(ApiResponse.success("Thành công", result));
    }

    @GetMapping("/table/{tableId}/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    @Operation(summary = "Đơn hàng đang hoạt động theo bàn")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getActiveOrdersByTable(@PathVariable Long tableId) {
        return ResponseEntity.ok(ApiResponse.success("Thành công", orderService.getActiveOrdersByTable(tableId)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    @Operation(summary = "Cập nhật trạng thái đơn hàng")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        orderService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công"));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Huỷ đơn hàng")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(@PathVariable Long id) {
        orderService.cancelOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Huỷ đơn hàng thành công"));
    }

    @GetMapping("/customer")
    @Operation(summary = "Lấy lịch sử đơn hàng của khách hàng hiện tại")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getCustomerOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User currentUser) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<OrderResponse> result = orderService.getOrdersByUser(currentUser.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Thành công", result));
    }
}
