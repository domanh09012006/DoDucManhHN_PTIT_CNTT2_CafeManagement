package com.example.coffeemanagement.controller;

import com.example.coffeemanagement.dto.response.ApiResponse;
import com.example.coffeemanagement.dto.response.DashboardResponse;
import com.example.coffeemanagement.dto.response.RevenueReportResponse;
import com.example.coffeemanagement.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard & Report", description = "API báo cáo và thống kê")
public class DashboardController {

    private final ReportService reportService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Tổng quan Dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        DashboardResponse dashboard = reportService.getDashboard();
        return ResponseEntity.ok(ApiResponse.success("Thành công", dashboard));
    }

    @GetMapping("/revenue")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Báo cáo doanh thu theo ngày")
    public ResponseEntity<ApiResponse<List<RevenueReportResponse>>> getRevenueReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        if (from == null) from = LocalDate.now().minusDays(29);
        if (to == null) to = LocalDate.now();

        if (from.isAfter(to)) {
            throw new IllegalArgumentException("Ngày bắt đầu phải trước ngày kết thúc");
        }

        List<RevenueReportResponse> report = reportService.getRevenueReport(from, to);
        return ResponseEntity.ok(ApiResponse.success("Thành công", report));
    }
}
