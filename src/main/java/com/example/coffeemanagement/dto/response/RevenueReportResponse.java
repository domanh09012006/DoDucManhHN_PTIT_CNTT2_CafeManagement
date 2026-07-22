package com.example.coffeemanagement.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueReportResponse {

    private LocalDate date;
    private BigDecimal revenue;
    private long orderCount;
    private BigDecimal averageOrderValue;
}
