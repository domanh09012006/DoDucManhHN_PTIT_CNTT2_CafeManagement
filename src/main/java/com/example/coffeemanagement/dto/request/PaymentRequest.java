package com.example.coffeemanagement.dto.request;

import com.example.coffeemanagement.enums.PaymentMethod;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRequest {

    @NotNull(message = "ID đơn hàng không được để trống")
    private Long orderId;

    @NotNull(message = "Phương thức thanh toán không được để trống")
    private PaymentMethod method;

    @NotNull(message = "Số tiền nhận không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Số tiền nhận phải lớn hơn 0")
    private BigDecimal amountReceived;

    private String transactionRef;

    private String notes;
}
