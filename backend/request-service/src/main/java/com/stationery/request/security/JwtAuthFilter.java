package com.stationery.request.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private final SecretKey key;

    public JwtAuthFilter(@Value("${jwt.secret:stationery-management-local-secret-key-that-is-long-enough-for-hmac}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        // Extract bearer token, parse claims and populate request attributes + SecurityContext.
        // actorEmail and userId attributes are used downstream by controllers/services for auditing and ownership.
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(auth.substring(7))
                    .getPayload();
            String role = claims.get("role", String.class);
            // subject -> user email, userId claim -> numeric id
            request.setAttribute("actorEmail", claims.getSubject());
            request.setAttribute("userId", Long.valueOf(claims.get("userId").toString()));
            // Set Spring Security principal so @PreAuthorize checks work
            SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                    claims.getSubject(), null, List.of(new SimpleGrantedAuthority("ROLE_" + role))));
        }
        chain.doFilter(request, response);
    }
}
