package com.stationery.inventory.exception;

import jakarta.persistence.EntityNotFoundException;
import java.time.Instant;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class ApiExceptionHandler {
    //handles validation errors that occur when the input data does not meet specified constraints
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    Map<String, Object> validation(MethodArgumentNotValidException ex) {
        return Map.of("timestamp", Instant.now(), "status", 400, "message", ex.getBindingResult().getFieldErrors().get(0).getDefaultMessage());
    }

    //handles cases where an entity is not found in the database,returning a 404 Not Found status code and an error message in the response body
    @ExceptionHandler(EntityNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    Map<String, Object> missing(RuntimeException ex) {
        return Map.of("timestamp", Instant.now(), "status", 404, "message", ex.getMessage());
    }

    //for handling conflicts,such as when trying to create an item that already exists in the inventory
    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    Map<String, Object> badRequest(RuntimeException ex) {
        return Map.of("timestamp", Instant.now(), "status", 400, "message", ex.getMessage());
    }
}
