package com.stationery.auth.exception;

import java.time.Instant;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

//handles global exceptions for the API and returns appropriate HTTP status codes and error messages in the response body
@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    Map<String, Object> validation(MethodArgumentNotValidException ex) {
        return Map.of("timestamp", Instant.now(), "status", 400, "message", ex.getBindingResult().getFieldErrors().get(0).getDefaultMessage());
    }

    //for handling conflicts, such as when trying to register with an email that already exists in the database
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    Map<String, Object> conflict(RuntimeException ex) {
        return Map.of("timestamp", Instant.now(), "status", 409, "message", ex.getMessage());
    }

    //for handling authentication failures, such as incorrect username or password
    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    Map<String, Object> unauthorized(RuntimeException ex) {
        return Map.of("timestamp", Instant.now(), "status", 401, "message", ex.getMessage());
    }
}
