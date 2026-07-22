package com.example.coffeemanagement.controller;

import com.example.coffeemanagement.dto.request.PaymentRequest;
import com.example.coffeemanagement.dto.response.ApiResponse;
import com.example.coffeemanagement.dto.response.PaymentResponse;
import com.example.coffeemanagement.entity.User;
import com.example.coffeemanagement.enums.PaymentStatus;
import com.example.coffeemanagement.service.PaymentService;
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

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payment Management", description = "API quản lý thanh toán")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @Operation(summary = "Xử lý thanh toán đơn hàng")
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(
            @Valid @RequestBody PaymentRequest request,
            @AuthenticationPrincipal User currentUser) {
        PaymentResponse response = paymentService.processPayment(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thanh toán thành công", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin thanh toán theo ID")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Thành công", paymentService.getPaymentById(id)));
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Lấy thanh toán theo đơn hàng")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByOrderId(@PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success("Thành công", paymentService.getPaymentByOrderId(orderId)));
    }

    @GetMapping("/code/{paymentCode}")
    @Operation(summary = "Lấy thanh toán theo mã")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByCode(@PathVariable String paymentCode) {
        return ResponseEntity.ok(ApiResponse.success("Thành công", paymentService.getPaymentByCode(paymentCode)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Tìm kiếm thanh toán (phân trang)")
    public ResponseEntity<ApiResponse<Page<PaymentResponse>>> searchPayments(
            @RequestParam(required = false) PaymentStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<PaymentResponse> result = paymentService.searchPayments(status, from, to, pageable);
        return ResponseEntity.ok(ApiResponse.success("Thành công", result));
    }

    @PatchMapping("/{id}/refund")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Hoàn tiền")
    public ResponseEntity<ApiResponse<Void>> refundPayment(
            @PathVariable Long id,
            @RequestParam String reason) {
        paymentService.refundPayment(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Hoàn tiền thành công"));
    }
}
