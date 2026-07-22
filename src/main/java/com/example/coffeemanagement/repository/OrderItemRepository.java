package com.example.coffeemanagement.repository;

import com.example.coffeemanagement.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    void deleteByOrderId(Long orderId);

    @org.springframework.data.jpa.repository.Query("SELECT new com.example.coffeemanagement.dto.response.DashboardResponse$TopProductResponse(oi.product.id, oi.product.name, SUM(oi.quantity), SUM(oi.subtotal)) " +
           "FROM OrderItem oi WHERE oi.order.status = 'COMPLETED' GROUP BY oi.product.id, oi.product.name ORDER BY SUM(oi.quantity) DESC")
    List<com.example.coffeemanagement.dto.response.DashboardResponse.TopProductResponse> findTopProducts(org.springframework.data.domain.Pageable pageable);
}
