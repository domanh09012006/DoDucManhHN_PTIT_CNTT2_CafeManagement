package com.example.coffeemanagement.service.impl;

import com.example.coffeemanagement.dto.request.UserRequest;
import com.example.coffeemanagement.dto.response.UserResponse;
import com.example.coffeemanagement.entity.User;
import com.example.coffeemanagement.enums.Role;
import com.example.coffeemanagement.enums.UserStatus;
import com.example.coffeemanagement.exception.DuplicateResourceException;
import com.example.coffeemanagement.exception.ResourceNotFoundException;
import com.example.coffeemanagement.repository.UserRepository;
import com.example.coffeemanagement.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findByRoleNot(Role.CUSTOMER).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    public UserResponse createUser(UserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Tên đăng nhập '" + request.getUsername() + "' đã tồn tại");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email '" + request.getEmail() + "' đã được đăng ký");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Mật khẩu không được để trống khi tạo mới");
        }

        User user = User.builder()
                .username(request.getUsername())
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .status(request.getStatus())
                .build();

        User saved = userRepository.save(user);
        log.info("User created: {} (ID: {})", saved.getUsername(), saved.getId());
        return toResponse(saved);
    }

    @Override
    public UserResponse updateUser(Long id, UserRequest request) {
        User user = findById(id);

        if (!user.getUsername().equalsIgnoreCase(request.getUsername()) && userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Tên đăng nhập '" + request.getUsername() + "' đã tồn tại");
        }
        if (!user.getEmail().equalsIgnoreCase(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email '" + request.getEmail() + "' đã được đăng ký");
        }

        user.setUsername(request.getUsername());
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        user.setStatus(request.getStatus());

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        User saved = userRepository.save(user);
        log.info("User updated: {} (ID: {})", saved.getUsername(), saved.getId());
        return toResponse(saved);
    }

    @Override
    public void toggleStatus(Long id) {
        User user = findById(id);
        if (user.getUsername().equalsIgnoreCase("admin")) {
            throw new IllegalArgumentException("Không thể khóa tài khoản quản trị hệ thống (admin)");
        }
        user.setStatus(user.getStatus() == UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE);
        userRepository.save(user);
        log.info("User status toggled: {} (Status: {})", user.getUsername(), user.getStatus());
    }

    @Override
    public void deleteUser(Long id) {
        User user = findById(id);
        if (user.getUsername().equalsIgnoreCase("admin")) {
            throw new IllegalArgumentException("Không thể xóa tài khoản quản trị hệ thống (admin)");
        }
        userRepository.delete(user);
        log.info("User deleted: {} (ID: {})", user.getUsername(), id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllCustomers() {
        return userRepository.findByRole(Role.CUSTOMER).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + id));
    }

    private UserResponse toResponse(User user) {
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
