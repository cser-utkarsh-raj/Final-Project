package com.stationery.request.controller;

import com.stationery.request.dto.RequestDtos.DecisionRequest;
import com.stationery.request.dto.RequestDtos.RequestResponse;
import com.stationery.request.dto.RequestDtos.SubmitRequest;
import com.stationery.request.model.RequestStatus;
import com.stationery.request.service.StationeryRequestService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/requests")
public class StationeryRequestController {
    private final StationeryRequestService service;

    public StationeryRequestController(StationeryRequestService service) {
        this.service = service;
    }

    // Student endpoint: submit a new request. User id is taken from request attribute set by JWT filter.
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('STUDENT')")
    RequestResponse submit(@Valid @RequestBody SubmitRequest input, HttpServletRequest request) {
        return service.submit(input, (Long) request.getAttribute("userId"), actor(request));
    }

    // Student endpoint: list own requests with optional status filter and pagination
    @GetMapping("/mine")
    @PreAuthorize("hasRole('STUDENT')")
    Page<RequestResponse> mine(@RequestParam(name = "status", required = false) RequestStatus status,
                               @RequestParam(name = "page", defaultValue = "0") int page,
                               @RequestParam(name = "size", defaultValue = "20") int size,
                               HttpServletRequest request) {
        return service.myRequests(actor(request), status, PageRequest.of(page, Math.min(size, 50), Sort.by("createdAt").descending()));
    }

    // Admin endpoint: list all requests with pagination
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    Page<RequestResponse> all(@RequestParam(name = "page", defaultValue = "0") int page,
                              @RequestParam(name = "size", defaultValue = "20") int size) {
        return service.all(PageRequest.of(page, Math.min(size, 50), Sort.by("createdAt").descending()));
    }

    // Admin endpoint: approve the request — this will deduct stock via InventoryClient and record an audit entry.
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    RequestResponse approve(@PathVariable Long id, HttpServletRequest request) {
        return service.approve(id, actor(request));
    }

    // Admin endpoint: reject the request with a reason; records rejection reason and audit.
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    RequestResponse reject(@PathVariable Long id, @Valid @RequestBody DecisionRequest decision, HttpServletRequest request) {
        return service.reject(id, decision.reason(), actor(request));
    }

    // Helper: get the acting user's email (set by JwtAuthFilter) for audit and ownership checks
    private String actor(HttpServletRequest request) {
        return request.getAttribute("actorEmail").toString();
    }
}
