package com.stationery.request.exception;

import jakarta.persistence.EntityNotFoundException;
import java.time.Instant;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    Map<String, Object> validation(MethodArgumentNotValidException ex) {
        return Map.of("timestamp", Instant.now(), "status", 400, "message", ex.getBindingResult().getFieldErrors().get(0).getDefaultMessage());
    }

    @ExceptionHandler(EntityNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    Map<String, Object> missing(RuntimeException ex) {
        return Map.of("timestamp", Instant.now(), "status", 404, "message", ex.getMessage());
    }

    @ExceptionHandler(IllegalStateException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    Map<String, Object> badRequest(RuntimeException ex) {
        return Map.of("timestamp", Instant.now(), "status", 400, "message", ex.getMessage());
    }

    @ExceptionHandler(feign.FeignException.class)
    public org.springframework.http.ResponseEntity<Map<String, Object>> handleFeign(feign.FeignException ex) {
        HttpStatus status = HttpStatus.resolve(ex.status());
        if (status == null) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }
        String message = ex.contentUTF8();
        if (message != null && message.contains("\"message\"")) {
            try {
                int start = message.indexOf("\"message\":\"") + 11;
                int end = message.indexOf("\"", start);
                if (start > 10 && end > start) {
                    message = message.substring(start, end);
                }
            } catch (Exception ignored) {}
        } else {
            message = ex.getMessage();
        }
        return org.springframework.http.ResponseEntity.status(status)
                .body(Map.of("timestamp", Instant.now(), "status", status.value(), "message", message));
    }
}
