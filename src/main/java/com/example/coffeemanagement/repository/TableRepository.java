package com.example.coffeemanagement.repository;

import com.example.coffeemanagement.entity.CafeTable;
import com.example.coffeemanagement.enums.TableStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TableRepository extends JpaRepository<CafeTable, Long> {

    boolean existsByTableNumber(String tableNumber);

    Optional<CafeTable> findByTableNumber(String tableNumber);

    List<CafeTable> findByStatus(TableStatus status);

    long countByStatus(TableStatus status);

    List<CafeTable> findByArea(String area);

    List<CafeTable> findAllByOrderByTableNumberAsc();
}
