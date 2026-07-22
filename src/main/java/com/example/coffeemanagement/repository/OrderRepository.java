package com.example.coffeemanagement.repository;

import com.example.coffeemanagement.entity.Order;
import com.example.coffeemanagement.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderCode(String orderCode);

    List<Order> findByTableId(Long tableId);

    List<Order> findByUserId(Long userId);

    List<Order> findByStatus(OrderStatus status);

    long countByStatus(OrderStatus status);

    @Query("SELECT o FROM Order o WHERE " +
           "(:status IS NULL OR o.status = :status) " +
           "AND (:tableId IS NULL OR o.table.id = :tableId) " +
           "AND (:from IS NULL OR o.createdAt >= :from) " +
           "AND (:to IS NULL OR o.createdAt <= :to)")
    Page<Order> searchOrders(@Param("status") OrderStatus status,
                              @Param("tableId") Long tableId,
                              @Param("from") LocalDateTime from,
                              @Param("to") LocalDateTime to,
                              Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.table.id = :tableId AND o.status NOT IN ('COMPLETED', 'CANCELLED')")
    List<Order> findActiveOrdersByTable(@Param("tableId") Long tableId);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'COMPLETED' " +
           "AND o.createdAt >= :from AND o.createdAt <= :to")
    java.math.BigDecimal sumRevenueByDateRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.orderSource = :source AND o.createdAt >= :from AND o.createdAt <= :to")
    long countByOrderSourceAndCreatedAtBetween(@Param("source") com.example.coffeemanagement.enums.OrderSource source, @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    Page<Order> findByUserId(Long userId, Pageable pageable);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("UPDATE Order o SET o.createdAt = :createdAt, o.updatedAt = :createdAt WHERE o.id = :id")
    void updateOrderTimestamps(@Param("id") Long id, @Param("createdAt") LocalDateTime createdAt);
}
