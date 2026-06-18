package com.stationery.auth.service;

import com.stationery.auth.dto.AuthDtos.LoginRequest;
import com.stationery.auth.dto.AuthDtos.RegisterRequest;
import com.stationery.auth.model.Role;
import com.stationery.auth.model.User;
import com.stationery.auth.repository.UserRepository;
import com.stationery.auth.security.JwtService;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthServiceTest {
    private final UserRepository users = mock(UserRepository.class);
    private final PasswordEncoder encoder = mock(PasswordEncoder.class);
    private final JwtService jwt = mock(JwtService.class);
    private final AuthService service = new AuthService(users, encoder, jwt);

    @Test
    void registerBlocksDuplicateEmail() {
        when(users.existsByEmail("a@college.edu")).thenReturn(true);
        assertThrows(IllegalArgumentException.class,
                () -> service.register(new RegisterRequest("A", "a@college.edu", "Password1", Role.STUDENT)));
    }

    @Test
    void loginRejectsBadPassword() {
        User user = new User("Student", "student@college.edu", "hash", Role.STUDENT);
        when(users.findByEmail("student@college.edu")).thenReturn(Optional.of(user));
        when(encoder.matches("wrong", "hash")).thenReturn(false);
        assertThrows(BadCredentialsException.class, () -> service.login(new LoginRequest("student@college.edu", "wrong")));
    }
}
