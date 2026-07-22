package com.example.coffeemanagement.controller;

import com.example.coffeemanagement.dto.request.UserRequest;
import com.example.coffeemanagement.dto.response.ApiResponse;
import com.example.coffeemanagement.dto.response.UserResponse;
import com.example.coffeemanagement.enums.Role;
import com.example.coffeemanagement.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
@Tag(name = "Customer Management", description = "API quản lý thông tin khách hàng")
public class CustomerController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Danh sách tất cả khách hàng")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllCustomers() {
        return ResponseEntity.ok(ApiResponse.success("Thành công", userService.getAllCustomers()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin khách hàng theo ID")
    public ResponseEntity<ApiResponse<UserResponse>> getCustomerById(@PathVariable Long id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("Thành công", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin khách hàng")
    public ResponseEntity<ApiResponse<UserResponse>> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody UserRequest request) {
        // Luôn đảm bảo role là CUSTOMER — không cho phép nâng quyền qua endpoint này
        request.setRole(Role.CUSTOMER);
        UserResponse response = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công", response));
    }

    @PatchMapping("/{id}/toggle-status")
    @Operation(summary = "Khóa/Mở khóa tài khoản khách hàng")
    public ResponseEntity<ApiResponse<Void>> toggleStatus(@PathVariable Long id) {
        userService.toggleStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa tài khoản khách hàng")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(@PathVariable Long id) {
        UserResponse target = userService.getUserById(id);
        if (target.getRole() != Role.CUSTOMER) {
            throw new IllegalArgumentException("Chỉ có thể xóa tài khoản khách hàng (CUSTOMER) qua endpoint này");
        }
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa tài khoản thành công"));
    }
}
