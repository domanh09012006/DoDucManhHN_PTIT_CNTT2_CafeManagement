package com.example.coffeemanagement.controller;

import com.example.coffeemanagement.dto.request.ReservationRequest;
import com.example.coffeemanagement.dto.response.ApiResponse;
import com.example.coffeemanagement.dto.response.ReservationResponse;
import com.example.coffeemanagement.entity.User;
import com.example.coffeemanagement.enums.ReservationStatus;
import com.example.coffeemanagement.service.ReservationService;
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
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@Tag(name = "Reservation Management", description = "API đặt bàn")
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    @Operation(summary = "Đặt bàn mới")
    public ResponseEntity<ApiResponse<ReservationResponse>> createReservation(
            @Valid @RequestBody ReservationRequest request,
            @AuthenticationPrincipal User currentUser) {
        Long customerId = null;
        if (currentUser.getRole() == com.example.coffeemanagement.enums.Role.CUSTOMER) {
            customerId = currentUser.getId();
        }
        ReservationResponse response = reservationService.createReservation(request, customerId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đặt bàn thành công", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    @Operation(summary = "Tìm kiếm đặt bàn (phân trang)")
    public ResponseEntity<ApiResponse<Page<ReservationResponse>>> searchReservations(
            @RequestParam(required = false) ReservationStatus status,
            @RequestParam(required = false) Long tableId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("reservationTime").descending());
        Page<ReservationResponse> result = reservationService.searchReservations(status, tableId, from, to, pageable);
        return ResponseEntity.ok(ApiResponse.success("Thành công", result));
    }

    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Lấy lịch sử đặt bàn của khách hàng hiện tại")
    public ResponseEntity<ApiResponse<List<ReservationResponse>>> getCustomerReservations(
            @AuthenticationPrincipal User currentUser) {
        List<ReservationResponse> result = reservationService.getReservationsByCustomer(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Thành công", result));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    @Operation(summary = "Cập nhật trạng thái đặt bàn (duyệt/check-in/hoàn thành)")
    public ResponseEntity<ApiResponse<ReservationResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam ReservationStatus status) {
        ReservationResponse response = reservationService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công", response));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Hủy lượt đặt bàn")
    public ResponseEntity<ApiResponse<Void>> cancelReservation(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        reservationService.cancelReservation(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Hủy đặt bàn thành công"));
    }
}
