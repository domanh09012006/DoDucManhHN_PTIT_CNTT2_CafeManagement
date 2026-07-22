package com.example.coffeemanagement.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRequest {

    private Long tableId;

    @NotEmpty(message = "Đơn hàng phải có ít nhất 1 sản phẩm")
    @Valid
    private List<OrderItemRequest> items;

    @DecimalMin(value = "0.0", message = "Giảm giá không được âm")
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    private String notes;

    private com.example.coffeemanagement.enums.OrderSource orderSource;
}
