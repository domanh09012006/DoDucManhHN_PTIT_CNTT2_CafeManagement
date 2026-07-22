package com.example.coffeemanagement.service.impl;

import com.example.coffeemanagement.dto.request.OrderItemRequest;
import com.example.coffeemanagement.dto.request.OrderRequest;
import com.example.coffeemanagement.dto.response.OrderItemResponse;
import com.example.coffeemanagement.dto.response.OrderResponse;
import com.example.coffeemanagement.entity.*;
import com.example.coffeemanagement.enums.OrderStatus;
import com.example.coffeemanagement.enums.TableStatus;
import com.example.coffeemanagement.enums.ReservationStatus;
import com.example.coffeemanagement.exception.ResourceNotFoundException;
import com.example.coffeemanagement.repository.*;
import com.example.coffeemanagement.service.OrderService;
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
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final TableRepository tableRepository;
    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;

    @Override
    public OrderResponse createOrder(OrderRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với ID: " + userId));

        CafeTable table = null;
        if (request.getTableId() != null) {
            table = tableRepository.findById(request.getTableId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bàn với ID: " + request.getTableId()));
        }

        com.example.coffeemanagement.enums.OrderSource source = request.getOrderSource();
        if (source == null) {
            if (user.getRole() == com.example.coffeemanagement.enums.Role.CUSTOMER) {
                source = com.example.coffeemanagement.enums.OrderSource.ONLINE;
            } else {
                source = com.example.coffeemanagement.enums.OrderSource.POS;
            }
        }

        OrderStatus initialStatus = OrderStatus.PENDING;
        if (source == com.example.coffeemanagement.enums.OrderSource.POS) {
            initialStatus = OrderStatus.CONFIRMED;
        }

        Order order = Order.builder()
                .orderCode(generateOrderCode())
                .table(table)
                .user(user)
                .status(initialStatus)
                .orderSource(source)
                .discountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO)
                .notes(request.getNotes())
                .build();

        // Calculate subtotal from items
        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + itemReq.getProductId()));

            BigDecimal itemSubtotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            subtotal = subtotal.add(itemSubtotal);

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(product.getPrice())
                    .subtotal(itemSubtotal)
                    .notes(itemReq.getNotes())
                    .build();
            order.getOrderItems().add(item);
        }

        order.setSubtotal(subtotal);
        BigDecimal discount = order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO;
        order.setTotalAmount(subtotal.subtract(discount).max(BigDecimal.ZERO));

        // Update table status to OCCUPIED
        if (table != null) {
            table.setStatus(TableStatus.OCCUPIED);
            tableRepository.save(table);
        }

        Order saved = orderRepository.save(order);
        log.info("Order created: {} for table: {}", saved.getOrderCode(),
                table != null ? table.getTableNumber() : "takeaway");
        return toResponse(saved);
    }

    @Override
    public OrderResponse updateOrder(Long id, OrderRequest request) {
        Order order = findById(id);

        if (order.getStatus() == OrderStatus.COMPLETED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalArgumentException("Không thể cập nhật đơn hàng đã " + order.getStatus());
        }

        // Update table
        if (request.getTableId() != null) {
            CafeTable table = tableRepository.findById(request.getTableId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bàn với ID: " + request.getTableId()));
            order.setTable(table);
        }

        order.setNotes(request.getNotes());
        if (request.getDiscountAmount() != null) {
            order.setDiscountAmount(request.getDiscountAmount());
        }

        // Rebuild order items
        order.getOrderItems().clear();

        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + itemReq.getProductId()));

            BigDecimal itemSubtotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            subtotal = subtotal.add(itemSubtotal);

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(product.getPrice())
                    .subtotal(itemSubtotal)
                    .notes(itemReq.getNotes())
                    .build();
            order.getOrderItems().add(item);
        }

        order.setSubtotal(subtotal);
        BigDecimal discount = order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO;
        order.setTotalAmount(subtotal.subtract(discount).max(BigDecimal.ZERO));

        Order saved = orderRepository.save(order);
        log.info("Order updated: {}", saved.getOrderCode());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderByCode(String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng: " + orderCode));
        return toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> searchOrders(OrderStatus status, Long tableId,
                                             LocalDateTime from, LocalDateTime to,
                                             Pageable pageable) {
        return orderRepository.searchOrders(status, tableId, from, to, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getActiveOrdersByTable(Long tableId) {
        return orderRepository.findActiveOrdersByTable(tableId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public void updateStatus(Long id, OrderStatus status) {
        Order order = findById(id);
        order.setStatus(status);

        // If completed, free the table
        if (status == OrderStatus.COMPLETED && order.getTable() != null) {
            CafeTable table = order.getTable();
            List<Order> activeOrders = orderRepository.findActiveOrdersByTable(table.getId());
            if (activeOrders.stream().allMatch(o -> o.getId().equals(id))) {
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

        orderRepository.save(order);
        log.info("Order {} status updated to {}", order.getOrderCode(), status);
    }

    @Override
    public void cancelOrder(Long id) {
        Order order = findById(id);
        if (order.getStatus() == OrderStatus.COMPLETED) {
            throw new IllegalArgumentException("Không thể huỷ đơn hàng đã hoàn thành");
        }
        order.setStatus(OrderStatus.CANCELLED);

        // Free the table if no more active orders
        if (order.getTable() != null) {
            CafeTable table = order.getTable();
            List<Order> activeOrders = orderRepository.findActiveOrdersByTable(table.getId());
            if (activeOrders.stream().allMatch(o -> o.getId().equals(id))) {
                table.setStatus(TableStatus.AVAILABLE);
                tableRepository.save(table);
            }
        }

        orderRepository.save(order);
        log.info("Order {} cancelled", order.getOrderCode());
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Order findById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + id));
    }

    private String generateOrderCode() {
        String prefix = "ORD" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return prefix + "-" + suffix;
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .productImageUrl(item.getProduct().getImageUrl())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .subtotal(item.getSubtotal())
                .notes(item.getNotes())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrdersByUser(Long userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable)
                .map(this::toResponse);
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getOrderItems()
                .stream().map(this::toItemResponse).collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .tableId(order.getTable() != null ? order.getTable().getId() : null)
                .tableNumber(order.getTable() != null ? order.getTable().getTableNumber() : null)
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .staffName(order.getUser() != null ? order.getUser().getFullName() : null)
                .status(order.getStatus())
                .orderSource(order.getOrderSource())
                .subtotal(order.getSubtotal())
                .discountAmount(order.getDiscountAmount())
                .totalAmount(order.getTotalAmount())
                .notes(order.getNotes())
                .items(itemResponses)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
