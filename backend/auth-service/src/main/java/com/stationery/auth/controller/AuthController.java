package com.stationery.auth.controller;

import com.stationery.auth.dto.AuthDtos.AuthResponse;
import com.stationery.auth.dto.AuthDtos.LoginRequest;
import com.stationery.auth.dto.AuthDtos.RegisterRequest;
import com.stationery.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController //
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    // so that the controller can use the authentication service to handle registration and login requests
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    //for handling registration requests,validating the input and returning an authentication response
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED) 
    AuthResponse register(@Valid @RequestBody RegisterRequest request) { 
        return authService.register(request); 
    }

    //for handling login requests
    @PostMapping("/login")
    AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
