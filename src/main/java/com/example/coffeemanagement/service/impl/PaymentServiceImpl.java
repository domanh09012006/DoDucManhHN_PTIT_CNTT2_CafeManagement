package com.example.coffeemanagement.service.impl;

import com.example.coffeemanagement.dto.request.PaymentRequest;
import com.example.coffeemanagement.dto.response.PaymentResponse;
import com.example.coffeemanagement.entity.CafeTable;
import com.example.coffeemanagement.entity.Order;
import com.example.coffeemanagement.entity.Payment;
import com.example.coffeemanagement.entity.User;
import com.example.coffeemanagement.enums.OrderStatus;
import com.example.coffeemanagement.enums.PaymentStatus;
import com.example.coffeemanagement.enums.TableStatus;
import com.example.coffeemanagement.exception.DuplicateResourceException;
import com.example.coffeemanagement.exception.ResourceNotFoundException;
import com.example.coffeemanagement.entity.Reservation;
import com.example.coffeemanagement.enums.ReservationStatus;
import com.example.coffeemanagement.repository.ReservationRepository;
import com.example.coffeemanagement.repository.OrderRepository;
import com.example.coffeemanagement.repository.PaymentRepository;
import com.example.coffeemanagement.repository.TableRepository;
import com.example.coffeemanagement.repository.UserRepository;
import com.example.coffeemanagement.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final TableRepository tableRepository;
    private final ReservationRepository reservationRepository;

    @Override
    public PaymentResponse processPayment(PaymentRequest request, Long cashierId) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + request.getOrderId()));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalArgumentException("Không thể thanh toán đơn hàng đã huỷ");
        }
        if (order.getStatus() == OrderStatus.COMPLETED) {
            throw new IllegalArgumentException("Đơn hàng đã được thanh toán");
        }

        if (paymentRepository.findByOrderId(order.getId()).isPresent()) {
            throw new DuplicateResourceException("Đơn hàng " + order.getOrderCode() + " đã được thanh toán");
        }

        // Validate amount
        if (request.getAmountReceived().compareTo(order.getTotalAmount()) < 0) {
            throw new IllegalArgumentException("Số tiền nhận không đủ. Cần ít nhất: " + order.getTotalAmount());
        }

        User cashier = userRepository.findById(cashierId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với ID: " + cashierId));

        BigDecimal changeAmount = request.getAmountReceived().subtract(order.getTotalAmount());

        Payment payment = Payment.builder()
                .paymentCode(generatePaymentCode())
                .order(order)
                .cashier(cashier)
                .method(request.getMethod())
                .status(PaymentStatus.PAID)
                .amount(order.getTotalAmount())
                .amountReceived(request.getAmountReceived())
                .changeAmount(changeAmount)
                .transactionRef(request.getTransactionRef())
                .notes(request.getNotes())
                .paidAt(LocalDateTime.now())
                .build();

        paymentRepository.save(payment);

        // Mark order as COMPLETED
        order.setStatus(OrderStatus.COMPLETED);
        orderRepository.save(order);

        // Free the table
        if (order.getTable() != null) {
            CafeTable table = order.getTable();
            List<Order> activeOrders = orderRepository.findActiveOrdersByTable(table.getId());
            if (activeOrders.stream().allMatch(o -> o.getId().equals(order.getId()))) {
                table.setStatus(TableStatus.AVAILABLE);
                tableRepository.save(table);

                // Auto-complete active reservations on this table
                List<Reservation> activeReservations = reservationRepository.findByTableIdAndStatusIn(
                        table.getId(), List.of(ReservationStatus.CONFIRMED, ReservationStatus.CHECKED_IN)
                );
                for (Reservation reservation : activeReservations) {
                    reservation.setStatus(ReservationStatus.COMPLETED);
                    reservationRepository.save(reservation);
                }
            }
        }

        log.info("Payment {} processed for order {}", payment.getPaymentCode(), order.getOrderCode());
        return toResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Chưa có thanh toán cho đơn hàng ID: " + orderId));
        return toResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByCode(String paymentCode) {
        Payment payment = paymentRepository.findByPaymentCode(paymentCode)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thanh toán: " + paymentCode));
        return toResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PaymentResponse> searchPayments(PaymentStatus status, LocalDateTime from, LocalDateTime to, Pageable pageable) {
        return paymentRepository.searchPayments(status, from, to, pageable)
                .map(this::toResponse);
    }

    @Override
    public void refundPayment(Long id, String reason) {
        Payment payment = findById(id);
        if (payment.getStatus() != PaymentStatus.PAID) {
            throw new IllegalArgumentException("Chỉ có thể hoàn tiền cho thanh toán đã thanh toán");
        }
        payment.setStatus(PaymentStatus.REFUNDED);
        payment.setNotes((payment.getNotes() != null ? payment.getNotes() + " | " : "") + "Hoàn tiền: " + reason);
        paymentRepository.save(payment);
        log.info("Payment {} refunded: {}", payment.getPaymentCode(), reason);
    }

    private Payment findById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thanh toán với ID: " + id));
    }

    private String generatePaymentCode() {
        String prefix = "PAY" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return prefix + "-" + suffix;
    }

    private PaymentResponse toResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .paymentCode(payment.getPaymentCode())
                .orderId(payment.getOrder().getId())
                .orderCode(payment.getOrder().getOrderCode())
                .cashierId(payment.getCashier() != null ? payment.getCashier().getId() : null)
                .cashierName(payment.getCashier() != null ? payment.getCashier().getFullName() : null)
                .method(payment.getMethod())
                .status(payment.getStatus())
                .amount(payment.getAmount())
                .amountReceived(payment.getAmountReceived())
                .changeAmount(payment.getChangeAmount())
                .transactionRef(payment.getTransactionRef())
                .notes(payment.getNotes())
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
