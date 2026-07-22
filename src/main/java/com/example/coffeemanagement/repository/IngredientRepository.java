package com.example.coffeemanagement.repository;

import com.example.coffeemanagement.entity.Ingredient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, Long> {

    boolean existsByName(String name);

    List<Ingredient> findByActiveTrue();

    @Query("SELECT i FROM Ingredient i WHERE i.currentStock <= i.minStockLevel AND i.active = true")
    List<Ingredient> findLowStockIngredients();

    @Query("SELECT i FROM Ingredient i WHERE " +
           "(:keyword IS NULL OR LOWER(i.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:active IS NULL OR i.active = :active)")
    Page<Ingredient> searchIngredients(@Param("keyword") String keyword,
                                        @Param("active") Boolean active,
                                        Pageable pageable);
}
