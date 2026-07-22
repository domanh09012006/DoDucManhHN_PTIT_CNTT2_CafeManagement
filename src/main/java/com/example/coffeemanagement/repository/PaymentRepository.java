package com.example.coffeemanagement.repository;

import com.example.coffeemanagement.entity.Payment;
import com.example.coffeemanagement.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrderId(Long orderId);

    Optional<Payment> findByPaymentCode(String paymentCode);

    @Query("SELECT p FROM Payment p WHERE " +
           "(:status IS NULL OR p.status = :status) " +
           "AND (:from IS NULL OR p.createdAt >= :from) " +
           "AND (:to IS NULL OR p.createdAt <= :to)")
    Page<Payment> searchPayments(@Param("status") PaymentStatus status,
                                  @Param("from") LocalDateTime from,
                                  @Param("to") LocalDateTime to,
                                  Pageable pageable);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("UPDATE Payment p SET p.createdAt = :createdAt, p.updatedAt = :createdAt, p.paidAt = :createdAt WHERE p.id = :id")
    void updatePaymentTimestamps(@Param("id") Long id, @Param("createdAt") LocalDateTime createdAt);
}
