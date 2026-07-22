package com.example.coffeemanagement.dto.response;

import com.example.coffeemanagement.enums.ReservationStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationResponse {
    private Long id;
    private Long tableId;
    private String tableNumber;
    private Long customerId;
    private String customerName;
    private LocalDateTime reservationTime;
    private Integer numberOfGuests;
    private ReservationStatus status;
    private String contactName;
    private String contactPhone;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
