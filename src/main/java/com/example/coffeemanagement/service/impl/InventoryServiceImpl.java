package com.example.coffeemanagement.service.impl;

import com.example.coffeemanagement.dto.request.IngredientRequest;
import com.example.coffeemanagement.dto.request.InventoryTransactionRequest;
import com.example.coffeemanagement.dto.response.IngredientResponse;
import com.example.coffeemanagement.dto.response.InventoryTransactionResponse;
import com.example.coffeemanagement.entity.Ingredient;
import com.example.coffeemanagement.entity.InventoryTransaction;
import com.example.coffeemanagement.entity.Supplier;
import com.example.coffeemanagement.entity.User;
import com.example.coffeemanagement.enums.TransactionType;
import com.example.coffeemanagement.exception.DuplicateResourceException;
import com.example.coffeemanagement.exception.ResourceNotFoundException;
import com.example.coffeemanagement.repository.*;
import com.example.coffeemanagement.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class InventoryServiceImpl implements InventoryService {

    private final IngredientRepository ingredientRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;

    // ─── Ingredient CRUD ─────────────────────────────────────────────────────

    @Override
    public IngredientResponse createIngredient(IngredientRequest request) {
        if (ingredientRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Nguyên liệu '" + request.getName() + "' đã tồn tại");
        }
        Supplier supplier = getSupplierOrNull(request.getSupplierId());
        Ingredient ingredient = Ingredient.builder()
                .name(request.getName())
                .unit(request.getUnit())
                .minStockLevel(request.getMinStockLevel() != null ? request.getMinStockLevel() : BigDecimal.ZERO)
                .maxStockLevel(request.getMaxStockLevel())
                .costPerUnit(request.getCostPerUnit())
                .description(request.getDescription())
                .supplier(supplier)
                .active(true)
                .build();
        Ingredient saved = ingredientRepository.save(ingredient);
        log.info("Ingredient created: {}", saved.getName());
        return toIngredientResponse(saved);
    }

    @Override
    public IngredientResponse updateIngredient(Long id, IngredientRequest request) {
        Ingredient ingredient = findIngredientById(id);
        if (!ingredient.getName().equals(request.getName()) && ingredientRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Nguyên liệu '" + request.getName() + "' đã tồn tại");
        }
        ingredient.setName(request.getName());
        ingredient.setUnit(request.getUnit());
        if (request.getMinStockLevel() != null) ingredient.setMinStockLevel(request.getMinStockLevel());
        if (request.getMaxStockLevel() != null) ingredient.setMaxStockLevel(request.getMaxStockLevel());
        if (request.getCostPerUnit() != null) ingredient.setCostPerUnit(request.getCostPerUnit());
        ingredient.setDescription(request.getDescription());
        ingredient.setSupplier(getSupplierOrNull(request.getSupplierId()));
        return toIngredientResponse(ingredientRepository.save(ingredient));
    }

    @Override
    @Transactional(readOnly = true)
    public IngredientResponse getIngredientById(Long id) {
        return toIngredientResponse(findIngredientById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<IngredientResponse> searchIngredients(String keyword, Boolean active, Pageable pageable) {
        return ingredientRepository.searchIngredients(keyword, active, pageable)
                .map(this::toIngredientResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IngredientResponse> getLowStockIngredients() {
        return ingredientRepository.findLowStockIngredients()
                .stream().map(this::toIngredientResponse).collect(Collectors.toList());
    }

    @Override
    public void toggleIngredientActive(Long id) {
        Ingredient ingredient = findIngredientById(id);
        ingredient.setActive(!ingredient.isActive());
        ingredientRepository.save(ingredient);
    }

    // ─── Transaction ─────────────────────────────────────────────────────────

    @Override
    public InventoryTransactionResponse recordTransaction(InventoryTransactionRequest request, Long userId) {
        Ingredient ingredient = findIngredientById(request.getIngredientId());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với ID: " + userId));
        Supplier supplier = getSupplierOrNull(request.getSupplierId());

        BigDecimal stockBefore = ingredient.getCurrentStock();
        BigDecimal newStock;

        switch (request.getType()) {
            case IMPORT:
            case RETURN:
                newStock = stockBefore.add(request.getQuantity());
                break;
            case EXPORT:
            case ADJUSTMENT:
                newStock = stockBefore.subtract(request.getQuantity());
                if (newStock.compareTo(BigDecimal.ZERO) < 0) {
                    throw new IllegalArgumentException("Tồn kho không đủ. Hiện có: " + stockBefore + " " + ingredient.getUnit());
                }
                break;
            default:
                throw new IllegalArgumentException("Loại giao dịch không hợp lệ");
        }

        BigDecimal totalCost = null;
        if (request.getUnitCost() != null) {
            totalCost = request.getUnitCost().multiply(request.getQuantity());
        }

        InventoryTransaction transaction = InventoryTransaction.builder()
                .ingredient(ingredient)
                .type(request.getType())
                .quantity(request.getQuantity())
                .unitCost(request.getUnitCost())
                .totalCost(totalCost)
                .stockBefore(stockBefore)
                .stockAfter(newStock)
                .performedBy(user)
                .supplier(supplier)
                .referenceCode(request.getReferenceCode())
                .notes(request.getNotes())
                .build();

        ingredient.setCurrentStock(newStock);
        ingredientRepository.save(ingredient);
        InventoryTransaction saved = transactionRepository.save(transaction);

        log.info("Inventory {} {} {} {} → {}", request.getType(), request.getQuantity(),
                ingredient.getUnit(), ingredient.getName(), newStock);
        return toTransactionResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InventoryTransactionResponse> searchTransactions(Long ingredientId, TransactionType type,
                                                                   LocalDateTime from, LocalDateTime to,
                                                                   Pageable pageable) {
        return transactionRepository.searchTransactions(ingredientId, type, from, to, pageable)
                .map(this::toTransactionResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryTransactionResponse> getTransactionsByIngredient(Long ingredientId) {
        return transactionRepository.findByIngredientId(ingredientId)
                .stream().map(this::toTransactionResponse).collect(Collectors.toList());
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Ingredient findIngredientById(Long id) {
        return ingredientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nguyên liệu với ID: " + id));
    }

    private Supplier getSupplierOrNull(Long supplierId) {
        if (supplierId == null) return null;
        return supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhà cung cấp với ID: " + supplierId));
    }

    private IngredientResponse toIngredientResponse(Ingredient ingredient) {
        boolean lowStock = ingredient.getMinStockLevel() != null &&
                           ingredient.getCurrentStock().compareTo(ingredient.getMinStockLevel()) <= 0;
        return IngredientResponse.builder()
                .id(ingredient.getId())
                .name(ingredient.getName())
                .unit(ingredient.getUnit())
                .currentStock(ingredient.getCurrentStock())
                .minStockLevel(ingredient.getMinStockLevel())
                .maxStockLevel(ingredient.getMaxStockLevel())
                .costPerUnit(ingredient.getCostPerUnit())
                .description(ingredient.getDescription())
                .active(ingredient.isActive())
                .lowStock(lowStock)
                .supplierId(ingredient.getSupplier() != null ? ingredient.getSupplier().getId() : null)
                .supplierName(ingredient.getSupplier() != null ? ingredient.getSupplier().getName() : null)
                .createdAt(ingredient.getCreatedAt())
                .updatedAt(ingredient.getUpdatedAt())
                .build();
    }

    private InventoryTransactionResponse toTransactionResponse(InventoryTransaction t) {
        return InventoryTransactionResponse.builder()
                .id(t.getId())
                .ingredientId(t.getIngredient().getId())
                .ingredientName(t.getIngredient().getName())
                .unit(t.getIngredient().getUnit())
                .type(t.getType())
                .quantity(t.getQuantity())
                .unitCost(t.getUnitCost())
                .totalCost(t.getTotalCost())
                .stockBefore(t.getStockBefore())
                .stockAfter(t.getStockAfter())
                .performedById(t.getPerformedBy() != null ? t.getPerformedBy().getId() : null)
                .performedByName(t.getPerformedBy() != null ? t.getPerformedBy().getFullName() : null)
                .supplierId(t.getSupplier() != null ? t.getSupplier().getId() : null)
                .supplierName(t.getSupplier() != null ? t.getSupplier().getName() : null)
                .referenceCode(t.getReferenceCode())
                .notes(t.getNotes())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
