package com.stationery.auth.service;

import com.stationery.auth.dto.AuthDtos.AuthResponse;
import com.stationery.auth.dto.AuthDtos.LoginRequest;
import com.stationery.auth.dto.AuthDtos.RegisterRequest;
import com.stationery.auth.model.User;
import com.stationery.auth.repository.UserRepository;
import com.stationery.auth.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (users.existsByEmail(email)) {
            throw new IllegalArgumentException("Email is already registered");
        }
        User user = users.save(new User(
                request.fullName().trim(),
                email,
                passwordEncoder.encode(request.password()),
                request.role()));
        return response(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = users.findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }
        return response(user);
    }

    private AuthResponse response(User user) {
        return new AuthResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole(), jwtService.generate(user), jwtService.expiresInSeconds());
    }
}
