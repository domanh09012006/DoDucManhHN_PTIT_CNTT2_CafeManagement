package com.example.coffeemanagement.service;

import com.example.coffeemanagement.dto.request.PaymentRequest;
import com.example.coffeemanagement.dto.response.PaymentResponse;
import com.example.coffeemanagement.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface PaymentService {

    PaymentResponse processPayment(PaymentRequest request, Long cashierId);

    PaymentResponse getPaymentById(Long id);

    PaymentResponse getPaymentByOrderId(Long orderId);

    PaymentResponse getPaymentByCode(String paymentCode);

    Page<PaymentResponse> searchPayments(PaymentStatus status,
                                          LocalDateTime from, LocalDateTime to,
                                          Pageable pageable);

    void refundPayment(Long id, String reason);
}
