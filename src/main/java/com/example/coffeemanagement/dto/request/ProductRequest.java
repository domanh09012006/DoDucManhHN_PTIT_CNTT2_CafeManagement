package com.example.coffeemanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRequest {

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(max = 150, message = "Tên sản phẩm không quá 150 ký tự")
    private String name;

    private String description;

    @NotNull(message = "Giá bán không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá bán phải lớn hơn 0")
    private BigDecimal price;

    @DecimalMin(value = "0.0", message = "Giá vốn không được âm")
    private BigDecimal costPrice;

    @NotNull(message = "Danh mục không được để trống")
    private Long categoryId;

    private String imageUrl;

    @Builder.Default
    private boolean featured = false;

    private Integer displayOrder;
}
