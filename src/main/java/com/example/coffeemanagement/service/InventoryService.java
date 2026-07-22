package com.example.coffeemanagement.service;

import com.example.coffeemanagement.dto.request.IngredientRequest;
import com.example.coffeemanagement.dto.request.InventoryTransactionRequest;
import com.example.coffeemanagement.dto.response.IngredientResponse;
import com.example.coffeemanagement.dto.response.InventoryTransactionResponse;
import com.example.coffeemanagement.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface InventoryService {

    IngredientResponse createIngredient(IngredientRequest request);

    IngredientResponse updateIngredient(Long id, IngredientRequest request);

    IngredientResponse getIngredientById(Long id);

    Page<IngredientResponse> searchIngredients(String keyword, Boolean active, Pageable pageable);

    List<IngredientResponse> getLowStockIngredients();

    void toggleIngredientActive(Long id);

    InventoryTransactionResponse recordTransaction(InventoryTransactionRequest request, Long userId);

    Page<InventoryTransactionResponse> searchTransactions(Long ingredientId, TransactionType type,
                                                           LocalDateTime from, LocalDateTime to,
                                                           Pageable pageable);

    List<InventoryTransactionResponse> getTransactionsByIngredient(Long ingredientId);
}
