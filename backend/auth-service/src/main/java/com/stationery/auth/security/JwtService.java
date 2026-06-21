package com.stationery.auth.security;

import com.stationery.auth.model.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

// service for generating and validating JWT tokens
@Service
public class JwtService {
    private final SecretKey key; //key used to sign the JWT token
    private final long expirationMs; //expiration time for the JWT token in milliseconds

    // Constructor to initialize the secret key and expiration time for JWT tokens
    public JwtService(
            @Value("${jwt.secret:stationery-management-local-secret-key-that-is-long-enough-for-hmac}") String secret,
            @Value("${jwt.expiration-ms:86400000}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)); //key used to sign the JWT token
        this.expirationMs = expirationMs; 
    }
    
    // Method to generate a JWT token for a given user
    public String generate(User user) { 
        // Get the current time and set the expiration time for the JWT token
        Instant now = Instant.now(); 
        return Jwts.builder() 
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .claim("role", user.getRole().name())
                .claim("fullName", user.getFullName())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expirationMs)))
                .signWith(key)
                .compact();
    }
    
    // Method to get the expiration time for the JWT token in seconds
    public long expiresInSeconds() { 
        return expirationMs / 1000;
    }
}
