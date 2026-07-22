package com.example.coffeemanagement.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {

    // ─── Revenue Summary ──────────────────────────────────────────────────────
    private BigDecimal todayRevenue;
    private BigDecimal weekRevenue;
    private BigDecimal monthRevenue;
    private BigDecimal revenueGrowthPercent;

    // ─── Order Summary ────────────────────────────────────────────────────────
    private long todayOrderCount;
    private long todayPosOrderCount;
    private long todayOnlineOrderCount;
    private long todayReservationCount;
    private long pendingOrderCount;
    private long completedOrderCount;

    // ─── Table Summary ────────────────────────────────────────────────────────
    private long totalTables;
    private long availableTables;
    private long occupiedTables;

    // ─── Employee Summary ─────────────────────────────────────────────────────
    private long totalEmployees;
    private long activeEmployees;

    // ─── Inventory Alerts ────────────────────────────────────────────────────
    private long lowStockIngredientCount;

    // ─── Top Products ─────────────────────────────────────────────────────────
    private List<TopProductResponse> topProducts;

    // ─── Revenue Chart (last 7 days) ─────────────────────────────────────────
    private List<RevenueReportResponse> recentRevenue;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopProductResponse {
        private Long productId;
        private String productName;
        private long quantitySold;
        private BigDecimal revenue;
    }
}
