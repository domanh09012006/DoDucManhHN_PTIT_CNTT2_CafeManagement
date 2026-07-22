package com.example.coffeemanagement.dto.response;

import com.example.coffeemanagement.enums.TableStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TableResponse {

    private Long id;
    private String tableNumber;
    private String area;
    private int capacity;
    private TableStatus status;
    private String qrCodeUrl;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
