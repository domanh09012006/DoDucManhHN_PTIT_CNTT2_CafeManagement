package com.example.coffeemanagement.service;

import com.example.coffeemanagement.dto.request.UserRequest;
import com.example.coffeemanagement.dto.response.UserResponse;
import com.example.coffeemanagement.enums.Role;
import com.example.coffeemanagement.enums.UserStatus;

import java.util.List;

public interface UserService {

    List<UserResponse> getAllUsers();

    UserResponse getUserById(Long id);

    UserResponse createUser(UserRequest request);

    UserResponse updateUser(Long id, UserRequest request);

    void toggleStatus(Long id);

    void deleteUser(Long id);

    List<UserResponse> getAllCustomers();
}
