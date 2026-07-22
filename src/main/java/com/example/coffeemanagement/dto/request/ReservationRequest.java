package com.example.coffeemanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationRequest {

    private Long tableId;

    @NotNull(message = "Thời gian đặt bàn không được để trống")
    @Future(message = "Thời gian đặt bàn phải là thời điểm trong tương lai")
    private LocalDateTime reservationTime;

    @NotNull(message = "Số lượng khách không được để trống")
    @Min(value = 1, message = "Số lượng khách phải từ 1 người")
    private Integer numberOfGuests;

    @NotBlank(message = "Tên liên hệ không được để trống")
    private String contactName;

    @NotBlank(message = "Số điện thoại liên hệ không được để trống")
    private String contactPhone;

    private String notes;
}
