package com.example.coffeemanagement.service.impl;

import com.example.coffeemanagement.dto.request.ReservationRequest;
import com.example.coffeemanagement.dto.response.ReservationResponse;
import com.example.coffeemanagement.entity.CafeTable;
import com.example.coffeemanagement.entity.Reservation;
import com.example.coffeemanagement.entity.User;
import com.example.coffeemanagement.enums.ReservationStatus;
import com.example.coffeemanagement.enums.TableStatus;
import com.example.coffeemanagement.exception.ResourceNotFoundException;
import com.example.coffeemanagement.repository.ReservationRepository;
import com.example.coffeemanagement.repository.TableRepository;
import com.example.coffeemanagement.repository.UserRepository;
import com.example.coffeemanagement.service.ReservationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final TableRepository tableRepository;
    private final UserRepository userRepository;

    @Override
    public ReservationResponse createReservation(ReservationRequest request, Long customerId) {
        User customer = null;
        if (customerId != null) {
            customer = userRepository.findById(customerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với ID: " + customerId));
        }

        CafeTable table = null;
        if (request.getTableId() != null) {
            table = tableRepository.findById(request.getTableId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bàn với ID: " + request.getTableId()));
        }

        Reservation reservation = Reservation.builder()
                .table(table)
                .customer(customer)
                .reservationTime(request.getReservationTime())
                .numberOfGuests(request.getNumberOfGuests())
                .status(ReservationStatus.PENDING)
                .contactName(request.getContactName())
                .contactPhone(request.getContactPhone())
                .notes(request.getNotes())
                .build();

        Reservation saved = reservationRepository.save(reservation);
        log.info("Reservation created successfully for {} at table {}", saved.getContactName(),
                table != null ? table.getTableNumber() : "unassigned");
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReservationResponse> searchReservations(ReservationStatus status, Long tableId,
                                                         LocalDateTime from, LocalDateTime to,
                                                         Pageable pageable) {
        return reservationRepository.searchReservations(status, tableId, from, to, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> getReservationsByCustomer(Long customerId) {
        return reservationRepository.findByCustomerIdOrderByReservationTimeDesc(customerId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public ReservationResponse updateStatus(Long id, ReservationStatus status) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lượt đặt bàn với ID: " + id));

        reservation.setStatus(status);

        // Manage table status changes according to reservation state
        if (reservation.getTable() != null) {
            CafeTable table = reservation.getTable();
            if (status == ReservationStatus.CHECKED_IN) {
                table.setStatus(TableStatus.OCCUPIED);
                tableRepository.save(table);
            } else if (status == ReservationStatus.COMPLETED || status == ReservationStatus.CANCELLED) {
                table.setStatus(TableStatus.AVAILABLE);
                tableRepository.save(table);
            } else if (status == ReservationStatus.CONFIRMED) {
                table.setStatus(TableStatus.RESERVED);
                tableRepository.save(table);
            }
        }

        Reservation saved = reservationRepository.save(reservation);
        log.info("Reservation ID {} status updated to {}", id, status);
        return toResponse(saved);
    }

    @Override
    public ReservationResponse updateReservation(Long id, ReservationRequest request) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lượt đặt bàn với ID: " + id));

        if (request.getTableId() != null) {
            CafeTable table = tableRepository.findById(request.getTableId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bàn với ID: " + request.getTableId()));
            reservation.setTable(table);
        }

        reservation.setReservationTime(request.getReservationTime());
        reservation.setNumberOfGuests(request.getNumberOfGuests());
        reservation.setContactName(request.getContactName());
        reservation.setContactPhone(request.getContactPhone());
        reservation.setNotes(request.getNotes());

        Reservation saved = reservationRepository.save(reservation);
        log.info("Reservation ID {} updated", id);
        return toResponse(saved);
    }

    @Override
    public void cancelReservation(Long id, Long userId) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lượt đặt bàn với ID: " + id));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với ID: " + userId));

        if (user.getRole() == com.example.coffeemanagement.enums.Role.CUSTOMER && 
            (reservation.getCustomer() == null || !reservation.getCustomer().getId().equals(userId))) {
            throw new IllegalArgumentException("Bạn không có quyền hủy đặt bàn của người khác");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        if (reservation.getTable() != null) {
            CafeTable table = reservation.getTable();
            table.setStatus(TableStatus.AVAILABLE);
            tableRepository.save(table);
        }
        reservationRepository.save(reservation);
        log.info("Reservation ID {} cancelled by user ID {}", id, userId);
    }

    private ReservationResponse toResponse(Reservation res) {
        return ReservationResponse.builder()
                .id(res.getId())
                .tableId(res.getTable() != null ? res.getTable().getId() : null)
                .tableNumber(res.getTable() != null ? res.getTable().getTableNumber() : null)
                .customerId(res.getCustomer() != null ? res.getCustomer().getId() : null)
                .customerName(res.getCustomer() != null ? res.getCustomer().getFullName() : null)
                .reservationTime(res.getReservationTime())
                .numberOfGuests(res.getNumberOfGuests())
                .status(res.getStatus())
                .contactName(res.getContactName())
                .contactPhone(res.getContactPhone())
                .notes(res.getNotes())
                .createdAt(res.getCreatedAt())
                .updatedAt(res.getUpdatedAt())
                .build();
    }
}
