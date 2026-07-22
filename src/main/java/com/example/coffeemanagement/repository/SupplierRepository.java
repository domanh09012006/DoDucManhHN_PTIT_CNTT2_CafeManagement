package com.example.coffeemanagement.repository;

import com.example.coffeemanagement.entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    boolean existsByName(String name);

    boolean existsByPhone(String phone);

    List<Supplier> findByActiveTrue();

    @Query("SELECT s FROM Supplier s WHERE " +
           "(:keyword IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(s.phone) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:active IS NULL OR s.active = :active)")
    Page<Supplier> searchSuppliers(@Param("keyword") String keyword,
                                    @Param("active") Boolean active,
                                    Pageable pageable);
}
