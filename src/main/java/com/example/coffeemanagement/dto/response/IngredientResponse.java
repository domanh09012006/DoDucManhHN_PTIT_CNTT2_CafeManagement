package com.example.coffeemanagement.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IngredientResponse {

    private Long id;
    private String name;
    private String unit;
    private BigDecimal currentStock;
    private BigDecimal minStockLevel;
    private BigDecimal maxStockLevel;
    private BigDecimal costPerUnit;
    private String description;
    private boolean active;
    private boolean lowStock;
    private Long supplierId;
    private String supplierName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
