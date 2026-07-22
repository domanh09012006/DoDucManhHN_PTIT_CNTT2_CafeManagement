package com.example.coffeemanagement.service;

import com.example.coffeemanagement.dto.request.ReservationRequest;
import com.example.coffeemanagement.dto.response.ReservationResponse;
import com.example.coffeemanagement.enums.ReservationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservationService {

    ReservationResponse createReservation(ReservationRequest request, Long customerId);

    Page<ReservationResponse> searchReservations(ReservationStatus status, Long tableId,
                                                 LocalDateTime from, LocalDateTime to,
                                                 Pageable pageable);

    List<ReservationResponse> getReservationsByCustomer(Long customerId);

    ReservationResponse updateStatus(Long id, ReservationStatus status);

    ReservationResponse updateReservation(Long id, ReservationRequest request);

    void cancelReservation(Long id, Long userId);
}
