package com.example.coffeemanagement.service;

import com.example.coffeemanagement.dto.request.TableRequest;
import com.example.coffeemanagement.dto.response.TableResponse;
import com.example.coffeemanagement.enums.TableStatus;

import com.example.coffeemanagement.dto.response.BookingSearchResponse;
import java.time.LocalDateTime;
import java.util.List;

public interface TableService {

    TableResponse createTable(TableRequest request);

    TableResponse updateTable(Long id, TableRequest request);

    TableResponse getTableById(Long id);

    TableResponse getTableByNumber(String tableNumber);

    List<TableResponse> getAllTables();

    List<TableResponse> getTablesByStatus(TableStatus status);

    void updateTableStatus(Long id, TableStatus status);

    void deleteTable(Long id);

    BookingSearchResponse searchAvailableTables(LocalDateTime reservationTime, int numberOfGuests);
}
