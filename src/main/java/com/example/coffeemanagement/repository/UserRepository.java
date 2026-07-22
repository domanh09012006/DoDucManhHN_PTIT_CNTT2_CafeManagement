package com.example.coffeemanagement.repository;

import com.example.coffeemanagement.entity.User;
import com.example.coffeemanagement.enums.Role;
import com.example.coffeemanagement.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByUsernameOrEmail(String username, String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    long countByStatus(UserStatus status);

    List<User> findByRoleNot(Role role);

    List<User> findByRole(Role role);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query(value = "UPDATE users SET role = 'CUSTOMER' WHERE role = 'STAFF'", nativeQuery = true)
    void migrateStaffToCustomer();
}
