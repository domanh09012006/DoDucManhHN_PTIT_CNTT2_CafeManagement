package com.example.coffeemanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TableRequest {

    @NotBlank(message = "Số bàn không được để trống")
    @Size(max = 10, message = "Số bàn không quá 10 ký tự")
    private String tableNumber;

    @Size(max = 50, message = "Khu vực không quá 50 ký tự")
    private String area;

    @Min(value = 1, message = "Sức chứa tối thiểu là 1")
    @Max(value = 50, message = "Sức chứa tối đa là 50")
    private int capacity = 4;

    private String qrCodeUrl;

    private String notes;
}
