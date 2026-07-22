package com.example.coffeemanagement.controller;

import com.example.coffeemanagement.dto.request.TableRequest;
import com.example.coffeemanagement.dto.response.ApiResponse;
import com.example.coffeemanagement.dto.response.TableResponse;
import com.example.coffeemanagement.enums.TableStatus;
import com.example.coffeemanagement.service.TableService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.example.coffeemanagement.dto.response.BookingSearchResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
@Tag(name = "Table Management", description = "API quản lý bàn")
public class TableController {

    private final TableService tableService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Thêm bàn mới")
    public ResponseEntity<ApiResponse<TableResponse>> createTable(@Valid @RequestBody TableRequest request) {
        TableResponse response = tableService.createTable(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thêm bàn thành công", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Cập nhật thông tin bàn")
    public ResponseEntity<ApiResponse<TableResponse>> updateTable(
            @PathVariable Long id,
            @Valid @RequestBody TableRequest request) {
        TableResponse response = tableService.updateTable(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật bàn thành công", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin bàn theo ID")
    public ResponseEntity<ApiResponse<TableResponse>> getTableById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Thành công", tableService.getTableById(id)));
    }

    @GetMapping("/number/{tableNumber}")
    @Operation(summary = "Lấy thông tin bàn theo số bàn")
    public ResponseEntity<ApiResponse<TableResponse>> getTableByNumber(@PathVariable String tableNumber) {
        return ResponseEntity.ok(ApiResponse.success("Thành công", tableService.getTableByNumber(tableNumber)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    @Operation(summary = "Danh sách tất cả bàn")
    public ResponseEntity<ApiResponse<List<TableResponse>>> getAllTables() {
        return ResponseEntity.ok(ApiResponse.success("Thành công", tableService.getAllTables()));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    @Operation(summary = "Lọc bàn theo trạng thái")
    public ResponseEntity<ApiResponse<List<TableResponse>>> getTablesByStatus(@PathVariable TableStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Thành công", tableService.getTablesByStatus(status)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    @Operation(summary = "Cập nhật trạng thái bàn")
    public ResponseEntity<ApiResponse<Void>> updateTableStatus(
            @PathVariable Long id,
            @RequestParam TableStatus status) {
        tableService.updateTableStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái bàn thành công"));
    }

    @GetMapping("/booking-search")
    @Operation(summary = "Tìm kiếm bàn trống cho lượt đặt bàn")
    public ResponseEntity<ApiResponse<BookingSearchResponse>> searchAvailableTables(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime reservationTime,
            @RequestParam int numberOfGuests) {
        BookingSearchResponse response = tableService.searchAvailableTables(reservationTime, numberOfGuests);
        return ResponseEntity.ok(ApiResponse.success("Thành công", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xoá bàn")
    public ResponseEntity<ApiResponse<Void>> deleteTable(@PathVariable Long id) {
        tableService.deleteTable(id);
        return ResponseEntity.ok(ApiResponse.success("Xoá bàn thành công"));
    }
}
