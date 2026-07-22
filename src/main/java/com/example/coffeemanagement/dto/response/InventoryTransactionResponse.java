package com.example.coffeemanagement.dto.response;

import com.example.coffeemanagement.enums.TransactionType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryTransactionResponse {

    private Long id;
    private Long ingredientId;
    private String ingredientName;
    private String unit;
    private TransactionType type;
    private BigDecimal quantity;
    private BigDecimal unitCost;
    private BigDecimal totalCost;
    private BigDecimal stockBefore;
    private BigDecimal stockAfter;
    private Long performedById;
    private String performedByName;
    private Long supplierId;
    private String supplierName;
    private String referenceCode;
    private String notes;
    private LocalDateTime createdAt;
}
