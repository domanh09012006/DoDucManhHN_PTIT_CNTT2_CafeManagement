package com.example.coffeemanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IngredientRequest {

    @NotBlank(message = "Tên nguyên liệu không được để trống")
    @Size(max = 100, message = "Tên không quá 100 ký tự")
    private String name;

    @NotBlank(message = "Đơn vị tính không được để trống")
    @Size(max = 20, message = "Đơn vị không quá 20 ký tự")
    private String unit;

    @DecimalMin(value = "0.0", message = "Tồn kho tối thiểu không được âm")
    private BigDecimal minStockLevel;

    private BigDecimal maxStockLevel;

    @DecimalMin(value = "0.0", message = "Giá nhập không được âm")
    private BigDecimal costPerUnit;

    private String description;

    private Long supplierId;
}
