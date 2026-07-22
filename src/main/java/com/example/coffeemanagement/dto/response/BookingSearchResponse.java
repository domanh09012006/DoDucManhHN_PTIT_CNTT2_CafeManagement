package com.example.coffeemanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingSearchResponse {
    private List<TableResponse> availableTables;
    private List<SuggestedSlot> suggestedSlots;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SuggestedSlot {
        private String time;
        private int availableCount;
    }
}
