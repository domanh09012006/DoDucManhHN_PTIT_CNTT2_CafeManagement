package com.example.coffeemanagement.service.impl;

import com.example.coffeemanagement.dto.response.DashboardResponse;
import com.example.coffeemanagement.dto.response.RevenueReportResponse;
import com.example.coffeemanagement.enums.*;
import com.example.coffeemanagement.repository.*;
import com.example.coffeemanagement.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final TableRepository tableRepository;
    private final UserRepository userRepository;
    private final IngredientRepository ingredientRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final ReservationRepository reservationRepository;

    @Override
    public DashboardResponse getDashboard() {
        LocalDate today = LocalDate.now();
        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime todayEnd = today.atTime(LocalTime.MAX);
        LocalDateTime weekStart = today.minusDays(7).atStartOfDay();
        LocalDateTime monthStart = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime now = LocalDateTime.now();

        // Revenue
        BigDecimal todayRevenue = orderRepository.sumRevenueByDateRange(todayStart, todayEnd);
        if (todayRevenue == null) todayRevenue = BigDecimal.ZERO;

        BigDecimal weekRevenue = orderRepository.sumRevenueByDateRange(weekStart, now);
        if (weekRevenue == null) weekRevenue = BigDecimal.ZERO;

        BigDecimal monthRevenue = orderRepository.sumRevenueByDateRange(monthStart, now);
        if (monthRevenue == null) monthRevenue = BigDecimal.ZERO;

        // Revenue growth (vs previous month)
        LocalDateTime prevMonthStart = monthStart.minusMonths(1);
        LocalDateTime prevMonthEnd = monthStart.minusSeconds(1);
        BigDecimal prevMonthRevenue = orderRepository.sumRevenueByDateRange(prevMonthStart, prevMonthEnd);
        if (prevMonthRevenue == null) prevMonthRevenue = BigDecimal.ZERO;

        double growthPercent = 0.0;
        if (prevMonthRevenue.compareTo(BigDecimal.ZERO) > 0) {
            growthPercent = monthRevenue.subtract(prevMonthRevenue)
                    .divide(prevMonthRevenue, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();
        }

        // Orders
        long todayOrderCount = orderRepository.searchOrders(null, null, todayStart, todayEnd,
                org.springframework.data.domain.PageRequest.of(0, 1)).getTotalElements();
        long todayPosOrderCount = orderRepository.countByOrderSourceAndCreatedAtBetween(
                com.example.coffeemanagement.enums.OrderSource.POS, todayStart, todayEnd);
        long todayOnlineOrderCount = orderRepository.countByOrderSourceAndCreatedAtBetween(
                com.example.coffeemanagement.enums.OrderSource.ONLINE, todayStart, todayEnd);
        long todayReservationCount = reservationRepository.countByReservationTimeBetween(todayStart, todayEnd);
        long pendingOrderCount   = orderRepository.countByStatus(OrderStatus.PENDING);
        long completedOrderCount = orderRepository.countByStatus(OrderStatus.COMPLETED);

        // Tables
        long totalTables     = tableRepository.count();
        long availableTables = tableRepository.countByStatus(TableStatus.AVAILABLE);
        long occupiedTables  = tableRepository.countByStatus(TableStatus.OCCUPIED);

        // Employees (mapped to Users since HR module is removed)
        long totalEmployees = userRepository.count();
        long activeEmployees = userRepository.countByStatus(UserStatus.ACTIVE);

        // Low stock
        long lowStockCount = ingredientRepository.findLowStockIngredients().size();

        // Recent 7-day revenue
        List<RevenueReportResponse> recentRevenue = buildDailyRevenue(today.minusDays(6), today);

        List<com.example.coffeemanagement.dto.response.DashboardResponse.TopProductResponse> topProducts = 
                orderItemRepository.findTopProducts(org.springframework.data.domain.PageRequest.of(0, 5));

        return DashboardResponse.builder()
                .todayRevenue(todayRevenue)
                .weekRevenue(weekRevenue)
                .monthRevenue(monthRevenue)
                .revenueGrowthPercent(BigDecimal.valueOf(growthPercent))
                .todayOrderCount(todayOrderCount)
                .todayPosOrderCount(todayPosOrderCount)
                .todayOnlineOrderCount(todayOnlineOrderCount)
                .todayReservationCount(todayReservationCount)
                .pendingOrderCount(pendingOrderCount)
                .completedOrderCount(completedOrderCount)
                .totalTables(totalTables)
                .availableTables(availableTables)
                .occupiedTables(occupiedTables)
                .totalEmployees(totalEmployees)
                .activeEmployees(activeEmployees)
                .lowStockIngredientCount(lowStockCount)
                .recentRevenue(recentRevenue)
                .topProducts(topProducts)
                .build();
    }

    @Override
    public List<RevenueReportResponse> getRevenueReport(LocalDate from, LocalDate to) {
        return buildDailyRevenue(from, to);
    }

    private List<RevenueReportResponse> buildDailyRevenue(LocalDate from, LocalDate to) {
        List<RevenueReportResponse> result = new ArrayList<>();
        LocalDate current = from;
        while (!current.isAfter(to)) {
            LocalDateTime dayStart = current.atStartOfDay();
            LocalDateTime dayEnd = current.atTime(LocalTime.MAX);
            BigDecimal revenue = orderRepository.sumRevenueByDateRange(dayStart, dayEnd);
            if (revenue == null) {
                revenue = BigDecimal.ZERO;
            }
            long count = orderRepository.searchOrders(OrderStatus.COMPLETED, null, dayStart, dayEnd,
                    org.springframework.data.domain.PageRequest.of(0, 1)).getTotalElements();

            BigDecimal avg = BigDecimal.ZERO;
            if (count > 0 && revenue.compareTo(BigDecimal.ZERO) > 0) {
                avg = revenue.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);
            }

            result.add(RevenueReportResponse.builder()
                    .date(current)
                    .revenue(revenue)
                    .orderCount(count)
                    .averageOrderValue(avg)
                    .build());
            current = current.plusDays(1);
        }
        return result;
    }
}
