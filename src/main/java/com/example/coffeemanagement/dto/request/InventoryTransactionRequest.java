package com.example.coffeemanagement.dto.request;

import com.example.coffeemanagement.enums.TransactionType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryTransactionRequest {

    @NotNull(message = "ID nguyên liệu không được để trống")
    private Long ingredientId;

    @NotNull(message = "Loại giao dịch không được để trống")
    private TransactionType type;

    @NotNull(message = "Số lượng không được để trống")
    @DecimalMin(value = "0.001", message = "Số lượng phải lớn hơn 0")
    private BigDecimal quantity;

    @DecimalMin(value = "0.0", message = "Đơn giá không được âm")
    private BigDecimal unitCost;

    private Long supplierId;

    private String referenceCode;

    private String notes;
}
