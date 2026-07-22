package com.example.coffeemanagement.dto.response;

import com.example.coffeemanagement.enums.PaymentMethod;
import com.example.coffeemanagement.enums.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {

    private Long id;
    private String paymentCode;
    private Long orderId;
    private String orderCode;
    private Long cashierId;
    private String cashierName;
    private PaymentMethod method;
    private PaymentStatus status;
    private BigDecimal amount;
    private BigDecimal amountReceived;
    private BigDecimal changeAmount;
    private String transactionRef;
    private String notes;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
}
