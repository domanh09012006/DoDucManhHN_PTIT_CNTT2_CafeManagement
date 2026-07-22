package com.example.coffeemanagement.dto.request;

import com.example.coffeemanagement.enums.Role;
import com.example.coffeemanagement.enums.UserStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UserRequest {

    @NotBlank(message = "Họ tên không được để trống")
    @Size(min = 2, max = 100, message = "Họ tên phải từ 2 đến 100 ký tự")
    private String fullName;

    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(min = 4, max = 50, message = "Tên đăng nhập phải từ 4 đến 50 ký tự")
    @Pattern(regexp = "^\\S+$", message = "Tên đăng nhập không được chứa khoảng trắng")
    private String username;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    private String phone;

    private String password; // Optional on updates

    @NotNull(message = "Vai trò không được để trống")
    private Role role;

    @NotNull(message = "Trạng thái không được để trống")
    private UserStatus status;
}
