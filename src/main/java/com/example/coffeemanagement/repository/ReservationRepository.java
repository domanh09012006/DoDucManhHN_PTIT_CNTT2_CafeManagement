package com.example.coffeemanagement.repository;

import com.example.coffeemanagement.entity.Reservation;
import com.example.coffeemanagement.enums.ReservationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByCustomerIdOrderByReservationTimeDesc(Long customerId);

    @Query("SELECT r FROM Reservation r WHERE " +
           "(:status IS NULL OR r.status = :status) " +
           "AND (:tableId IS NULL OR r.table.id = :tableId) " +
           "AND (:from IS NULL OR r.reservationTime >= :from) " +
           "AND (:to IS NULL OR r.reservationTime <= :to)")
    Page<Reservation> searchReservations(@Param("status") ReservationStatus status,
                                         @Param("tableId") Long tableId,
                                         @Param("from") LocalDateTime from,
                                         @Param("to") LocalDateTime to,
                                         Pageable pageable);

    long countByReservationTimeBetween(LocalDateTime from, LocalDateTime to);
    
    long countByCreatedAtBetween(LocalDateTime from, LocalDateTime to);

    @Query("SELECT r FROM Reservation r WHERE r.status IN :statuses " +
           "AND r.reservationTime > :startTime AND r.reservationTime < :endTime")
    List<Reservation> findConflictingReservations(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("statuses") List<ReservationStatus> statuses);

    List<Reservation> findByTableIdAndStatusIn(Long tableId, List<ReservationStatus> statuses);
}
