package com.example.coffeemanagement.service;

import com.example.coffeemanagement.dto.request.LoginRequest;
import com.example.coffeemanagement.dto.request.RegisterRequest;
import com.example.coffeemanagement.dto.response.AuthResponse;
import com.example.coffeemanagement.dto.response.UserResponse;

public interface AuthService {

    AuthResponse login(LoginRequest request);

    UserResponse register(RegisterRequest request);
}
