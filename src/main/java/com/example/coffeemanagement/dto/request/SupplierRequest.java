package com.example.coffeemanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierRequest {

    @NotBlank(message = "Tên nhà cung cấp không được để trống")
    @Size(max = 150, message = "Tên không quá 150 ký tự")
    private String name;

    @Size(max = 100, message = "Tên liên hệ không quá 100 ký tự")
    private String contactPerson;

    @Pattern(regexp = "^[0-9]{9,11}$", message = "Số điện thoại không hợp lệ")
    private String phone;

    @Email(message = "Email không hợp lệ")
    private String email;

    @Size(max = 255, message = "Địa chỉ không quá 255 ký tự")
    private String address;

    @Size(max = 30, message = "Mã số thuế không quá 30 ký tự")
    private String taxCode;

    private String notes;
}
