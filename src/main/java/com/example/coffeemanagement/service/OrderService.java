package com.example.coffeemanagement.service;

import com.example.coffeemanagement.dto.request.OrderRequest;
import com.example.coffeemanagement.dto.response.OrderResponse;
import com.example.coffeemanagement.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderService {

    OrderResponse createOrder(OrderRequest request, Long userId);

    OrderResponse updateOrder(Long id, OrderRequest request);

    OrderResponse getOrderById(Long id);

    OrderResponse getOrderByCode(String orderCode);

    Page<OrderResponse> searchOrders(OrderStatus status, Long tableId,
                                      LocalDateTime from, LocalDateTime to,
                                      Pageable pageable);

    List<OrderResponse> getActiveOrdersByTable(Long tableId);

    void updateStatus(Long id, OrderStatus status);

    void cancelOrder(Long id);

    Page<OrderResponse> getOrdersByUser(Long userId, Pageable pageable);
}
