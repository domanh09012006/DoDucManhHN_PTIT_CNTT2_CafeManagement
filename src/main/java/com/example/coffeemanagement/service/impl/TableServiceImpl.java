package com.example.coffeemanagement.service.impl;

import com.example.coffeemanagement.dto.request.TableRequest;
import com.example.coffeemanagement.dto.response.TableResponse;
import com.example.coffeemanagement.entity.CafeTable;
import com.example.coffeemanagement.enums.TableStatus;
import com.example.coffeemanagement.exception.DuplicateResourceException;
import com.example.coffeemanagement.exception.ResourceNotFoundException;
import com.example.coffeemanagement.dto.response.BookingSearchResponse;
import com.example.coffeemanagement.enums.ReservationStatus;
import com.example.coffeemanagement.entity.Reservation;
import com.example.coffeemanagement.repository.ReservationRepository;
import com.example.coffeemanagement.repository.TableRepository;
import com.example.coffeemanagement.service.TableService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TableServiceImpl implements TableService {

    private final TableRepository tableRepository;
    private final ReservationRepository reservationRepository;

    @Override
    public TableResponse createTable(TableRequest request) {
        if (tableRepository.existsByTableNumber(request.getTableNumber())) {
            throw new DuplicateResourceException("Bàn số '" + request.getTableNumber() + "' đã tồn tại");
        }
        CafeTable table = CafeTable.builder()
                .tableNumber(request.getTableNumber())
                .area(request.getArea())
                .capacity(request.getCapacity())
                .qrCodeUrl(request.getQrCodeUrl())
                .notes(request.getNotes())
                .status(TableStatus.AVAILABLE)
                .build();
        CafeTable saved = tableRepository.save(table);
        log.info("Table created: {}", saved.getTableNumber());
        return toResponse(saved);
    }

    @Override
    public TableResponse updateTable(Long id, TableRequest request) {
        CafeTable table = findById(id);
        if (!table.getTableNumber().equals(request.getTableNumber())
                && tableRepository.existsByTableNumber(request.getTableNumber())) {
            throw new DuplicateResourceException("Bàn số '" + request.getTableNumber() + "' đã tồn tại");
        }
        table.setTableNumber(request.getTableNumber());
        table.setArea(request.getArea());
        table.setCapacity(request.getCapacity());
        table.setQrCodeUrl(request.getQrCodeUrl());
        table.setNotes(request.getNotes());
        CafeTable saved = tableRepository.save(table);
        log.info("Table updated: {}", saved.getTableNumber());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public TableResponse getTableById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public TableResponse getTableByNumber(String tableNumber) {
        CafeTable table = tableRepository.findByTableNumber(tableNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bàn số: " + tableNumber));
        return toResponse(table);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TableResponse> getAllTables() {
        return tableRepository.findAllByOrderByTableNumberAsc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TableResponse> getTablesByStatus(TableStatus status) {
        return tableRepository.findByStatus(status)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public void updateTableStatus(Long id, TableStatus status) {
        CafeTable table = findById(id);
        table.setStatus(status);
        tableRepository.save(table);
        log.info("Table {} status updated to {}", table.getTableNumber(), status);
    }

    @Override
    public void deleteTable(Long id) {
        CafeTable table = findById(id);
        if (table.getStatus() == TableStatus.OCCUPIED) {
            throw new IllegalArgumentException("Không thể xoá bàn đang có khách");
        }
        tableRepository.delete(table);
        log.info("Table {} deleted", table.getTableNumber());
    }

    private CafeTable findById(Long id) {
        return tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bàn với ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public BookingSearchResponse searchAvailableTables(LocalDateTime reservationTime, int numberOfGuests) {
        List<CafeTable> available = getAvailableTables(reservationTime, numberOfGuests);
        List<BookingSearchResponse.SuggestedSlot> suggestions = new ArrayList<>();

        if (available.isEmpty()) {
            // Suggest alternative slots: -2h, -1h, +1h, +2h
            List<LocalDateTime> checkTimes = List.of(
                    reservationTime.minusHours(2),
                    reservationTime.minusHours(1),
                    reservationTime.plusHours(1),
                    reservationTime.plusHours(2)
            );

            for (LocalDateTime t : checkTimes) {
                // Only suggest slots between 7:00 and 22:00
                if (t.getHour() >= 7 && t.getHour() <= 22) {
                    List<CafeTable> availAtT = getAvailableTables(t, numberOfGuests);
                    if (!availAtT.isEmpty()) {
                        suggestions.add(BookingSearchResponse.SuggestedSlot.builder()
                                .time(t.toString())
                                .availableCount(availAtT.size())
                                .build());
                    }
                }
            }
        }

        return BookingSearchResponse.builder()
                .availableTables(available.stream().map(this::toResponse).collect(Collectors.toList()))
                .suggestedSlots(suggestions)
                .build();
    }

    private List<CafeTable> getAvailableTables(LocalDateTime time, int guests) {
        List<CafeTable> allTables = tableRepository.findAll().stream()
                .filter(t -> t.getStatus() != TableStatus.OUT_OF_SERVICE)
                .filter(t -> t.getCapacity() >= guests)
                .collect(Collectors.toList());

        LocalDateTime startTime = time.minusHours(2);
        LocalDateTime endTime = time.plusHours(2);

        List<Reservation> conflicting = reservationRepository.findConflictingReservations(
                startTime, endTime, List.of(ReservationStatus.PENDING, ReservationStatus.CONFIRMED, ReservationStatus.CHECKED_IN)
        );

        List<Long> conflictedTableIds = conflicting.stream()
                .map(r -> r.getTable() != null ? r.getTable().getId() : null)
                .filter(id -> id != null)
                .collect(Collectors.toList());

        LocalDateTime now = LocalDateTime.now();
        boolean isCloseToNow = time.isAfter(now.minusHours(2)) && time.isBefore(now.plusHours(2));

        return allTables.stream()
                .filter(t -> !conflictedTableIds.contains(t.getId()))
                .filter(t -> !isCloseToNow || (t.getStatus() != TableStatus.OCCUPIED && t.getStatus() != TableStatus.RESERVED))
                .collect(Collectors.toList());
    }

    private TableResponse toResponse(CafeTable table) {
        return TableResponse.builder()
                .id(table.getId())
                .tableNumber(table.getTableNumber())
                .area(table.getArea())
                .capacity(table.getCapacity())
                .status(table.getStatus())
                .qrCodeUrl(table.getQrCodeUrl())
                .notes(table.getNotes())
                .createdAt(table.getCreatedAt())
                .updatedAt(table.getUpdatedAt())
                .build();
    }
}
