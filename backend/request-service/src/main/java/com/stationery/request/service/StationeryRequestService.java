package com.stationery.request.service;

import com.stationery.request.client.InventoryClient;
import com.stationery.request.dto.RequestDtos.*;
import com.stationery.request.model.*;
import com.stationery.request.repository.RequestAuditLogRepository;
import com.stationery.request.repository.StationeryRequestRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StationeryRequestService {
    private final StationeryRequestRepository requests;
    private final RequestAuditLogRepository audits;
    private final InventoryClient inventoryClient;

    public StationeryRequestService(StationeryRequestRepository requests, RequestAuditLogRepository audits, InventoryClient inventoryClient) {
        this.requests = requests;
        this.audits = audits;
        this.inventoryClient = inventoryClient;
    }

    // Create and persist a new request with lines, then write an audit record.
    @Transactional
    public RequestResponse submit(SubmitRequest input, Long studentId, String email) {
        StationeryRequest request = new StationeryRequest(studentId, email);
        input.items().forEach(line -> request.addLine(line.itemId(), line.itemName(), line.quantity()));
        StationeryRequest saved = requests.save(request);
        audits.save(new RequestAuditLog(saved.getId(), "REQUEST_SUBMITTED", email, "Items: " + saved.getLines().size()));
        return toResponse(saved);
    }

    // Fetch paginated requests for a student, optionally filtered by status
    public Page<RequestResponse> myRequests(String email, RequestStatus status, Pageable pageable) {
        Page<StationeryRequest> page = status == null
                ? requests.findByStudentEmail(email, pageable)
                : requests.findByStudentEmailAndStatus(email, status, pageable);
        return page.map(this::toResponse);
    }

    // Admin: fetch all requests with pagination
    public Page<RequestResponse> all(Pageable pageable) {
        return requests.findAll(pageable).map(this::toResponse);
    }

    // Approve: deduct inventory for each line (calls inventory-service) then mark request approved and audit.
    @Transactional
    public RequestResponse approve(Long requestId, String actorEmail) {
        StationeryRequest request = get(requestId);
        request.getLines().forEach(line -> inventoryClient.deduct(new StockDeductionRequest(line.getItemId(), line.getQuantity())));
        request.approve();
        audits.save(new RequestAuditLog(request.getId(), "REQUEST_APPROVED", actorEmail, "Inventory deducted"));
        return toResponse(request);
    }

    // Reject: set rejection reason, update status and create audit entry.
    @Transactional
    public RequestResponse reject(Long requestId, String reason, String actorEmail) {
        StationeryRequest request = get(requestId);
        request.reject(reason);
        audits.save(new RequestAuditLog(request.getId(), "REQUEST_REJECTED", actorEmail, reason));
        return toResponse(request);
    }

    // Helper: fetch request or throw if missing — used by admin actions
    private StationeryRequest get(Long id) {
        return requests.findById(id).orElseThrow(() -> new EntityNotFoundException("Request not found"));
    }

    // Convert entity to DTO for API responses
    private RequestResponse toResponse(StationeryRequest request) {
        return new RequestResponse(request.getId(), request.getStudentId(), request.getStudentEmail(), request.getStatus(),
                request.getRejectionReason(), request.getCreatedAt(),
                request.getLines().stream().map(line -> new RequestLineResponse(line.getItemId(), line.getItemName(), line.getQuantity())).toList());
    }
}
