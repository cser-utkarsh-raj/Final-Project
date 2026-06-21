package com.stationery.auth.dto;

import com.stationery.auth.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

// contains data transfer objects (DTOs) for handling authentication-related requests and responses in the application
public class AuthDtos { 
    public record RegisterRequest(
            @NotBlank String fullName,
            @Email @NotBlank String email,
            @Size(min = 8, message = "Password must contain at least 8 characters") String password,
            @NotNull Role role
    ) {}

    // DTO for login requests
    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}

    // DTO for authentication responses, including user details and JWT token information
    public record AuthResponse(Long userId, String fullName, String email, Role role, String token, long expiresInSeconds) {}
}
