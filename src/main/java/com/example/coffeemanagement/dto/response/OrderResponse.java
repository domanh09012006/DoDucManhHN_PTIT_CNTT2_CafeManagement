package com.example.coffeemanagement.dto.response;

import com.example.coffeemanagement.enums.OrderStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {

    private Long id;
    private String orderCode;
    private Long tableId;
    private String tableNumber;
    private Long userId;
    private String staffName;
    private OrderStatus status;
    private com.example.coffeemanagement.enums.OrderSource orderSource;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String notes;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
