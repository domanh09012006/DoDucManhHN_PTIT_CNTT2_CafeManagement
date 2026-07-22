package com.example.coffeemanagement.repository;

import com.example.coffeemanagement.entity.InventoryTransaction;
import com.example.coffeemanagement.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {

    List<InventoryTransaction> findByIngredientId(Long ingredientId);

    @Query("SELECT t FROM InventoryTransaction t WHERE " +
           "(:ingredientId IS NULL OR t.ingredient.id = :ingredientId) " +
           "AND (:type IS NULL OR t.type = :type) " +
           "AND (:from IS NULL OR t.createdAt >= :from) " +
           "AND (:to IS NULL OR t.createdAt <= :to)")
    Page<InventoryTransaction> searchTransactions(@Param("ingredientId") Long ingredientId,
                                                   @Param("type") TransactionType type,
                                                   @Param("from") LocalDateTime from,
                                                   @Param("to") LocalDateTime to,
                                                   Pageable pageable);
}
