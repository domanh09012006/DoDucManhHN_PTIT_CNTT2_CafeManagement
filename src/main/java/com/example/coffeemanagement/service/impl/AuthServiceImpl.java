package com.example.coffeemanagement.service.impl;

import com.example.coffeemanagement.dto.request.LoginRequest;
import com.example.coffeemanagement.dto.request.RegisterRequest;
import com.example.coffeemanagement.dto.response.AuthResponse;
import com.example.coffeemanagement.dto.response.UserResponse;
import com.example.coffeemanagement.entity.User;
import com.example.coffeemanagement.enums.Role;
import com.example.coffeemanagement.enums.UserStatus;
import com.example.coffeemanagement.exception.AccountLockedException;
import com.example.coffeemanagement.exception.DuplicateResourceException;
import com.example.coffeemanagement.repository.UserRepository;
import com.example.coffeemanagement.security.JwtService;
import com.example.coffeemanagement.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 30;

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    // ─── Login ────────────────────────────────────────────────────────────────

    @Override
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getUsernameOrEmail();

        User user = userRepository.findByUsernameOrEmail(identifier, identifier)
                .orElseThrow(() -> new BadCredentialsException("Tên đăng nhập hoặc mật khẩu không đúng"));

        // Check if account is disabled (INACTIVE)
        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new AccountLockedException("Tài khoản của bạn đã bị vô hiệu hoá. Vui lòng liên hệ Admin");
        }

        // Check if account is temporarily locked
        if (user.getLockedUntil() != null && LocalDateTime.now().isBefore(user.getLockedUntil())) {
            long minutesLeft = java.time.Duration.between(LocalDateTime.now(), user.getLockedUntil()).toMinutes() + 1;
            throw new AccountLockedException(
                    "Tài khoản bị khoá tạm thời. Vui lòng thử lại sau " + minutesLeft + " phút"
            );
        }

        // Validate password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            handleFailedLogin(user);
            throw new BadCredentialsException("Tên đăng nhập hoặc mật khẩu không đúng");
        }

        // Reset failed login count on success
        user.setFailedLoginCount(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        log.info("User '{}' logged in successfully", user.getUsername());

        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .accessToken(token)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    // ─── Register ─────────────────────────────────────────────────────────────

    @Override
    public UserResponse register(RegisterRequest request) {
        // Validate password confirmation
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu xác nhận không khớp");
        }

        // Check unique username
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Tên đăng nhập '" + request.getUsername() + "' đã được sử dụng");
        }

        // Check unique email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email '" + request.getEmail() + "' đã được đăng ký");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .username(request.getUsername())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);
        log.info("New user registered: '{}'", savedUser.getUsername());

        return mapToUserResponse(savedUser);
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────

    private void handleFailedLogin(User user) {
        int attempts = user.getFailedLoginCount() + 1;
        user.setFailedLoginCount(attempts);

        if (attempts >= MAX_FAILED_ATTEMPTS) {
            user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_DURATION_MINUTES));
            user.setFailedLoginCount(0);
            log.warn("User '{}' account locked after {} failed attempts", user.getUsername(), MAX_FAILED_ATTEMPTS);
        }

        userRepository.save(user);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
