package com.example.coffeemanagement.controller;

import com.example.coffeemanagement.dto.request.LoginRequest;
import com.example.coffeemanagement.dto.request.RegisterRequest;
import com.example.coffeemanagement.dto.response.ApiResponse;
import com.example.coffeemanagement.dto.response.AuthResponse;
import com.example.coffeemanagement.dto.response.UserResponse;
import com.example.coffeemanagement.entity.User;
import com.example.coffeemanagement.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "API đăng nhập, đăng ký, đăng xuất")
public class AuthController {

    private final AuthService authService;

    /**
     * UC01 – Đăng nhập
     * POST /api/auth/login
     */
    @PostMapping("/login")
    @Operation(summary = "Đăng nhập", description = "Đăng nhập bằng username hoặc email, trả về JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(
                ApiResponse.success("Đăng nhập thành công", authResponse)
        );
    }

    /**
     * UC01 extension – Đăng ký (tự đăng ký với role mặc định STAFF)
     * POST /api/auth/register
     */
    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản", description = "Tạo tài khoản mới với role mặc định CUSTOMER")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse userResponse = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đăng ký tài khoản thành công", userResponse));
    }

    /**
     * UC02 – Đăng xuất
     * POST /api/auth/logout
     * Token được xoá ở phía Frontend (stateless JWT)
     */
    @PostMapping("/logout")
    @Operation(summary = "Đăng xuất", description = "Đăng xuất – Frontend xoá token khỏi localStorage")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công"));
    }

    /**
     * Lấy thông tin người dùng hiện tại
     * GET /api/auth/me
     */
    @GetMapping("/me")
    @Operation(summary = "Thông tin người dùng", description = "Lấy thông tin tài khoản đang đăng nhập")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Chưa xác thực"));
        }
        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
        return ResponseEntity.ok(ApiResponse.success("Thành công", userResponse));
    }
}
