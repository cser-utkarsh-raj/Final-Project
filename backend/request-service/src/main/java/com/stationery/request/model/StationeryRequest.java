package com.stationery.request.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "stationery_requests")
public class StationeryRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private Long studentId;
    @Column(nullable = false)
    private String studentEmail;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.PENDING;
    private String rejectionReason;
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RequestLine> lines = new ArrayList<>();

    protected StationeryRequest() {}

    public StationeryRequest(Long studentId, String studentEmail) {
        this.studentId = studentId;
        this.studentEmail = studentEmail;
    }

    public void addLine(Long itemId, String itemName, int quantity) {
        lines.add(new RequestLine(this, itemId, itemName, quantity));
    }

    public void approve() {
        if (status != RequestStatus.PENDING) throw new IllegalStateException("Only pending requests can be approved");
        status = RequestStatus.APPROVED;
        updatedAt = Instant.now();
    }

    public void reject(String reason) {
        if (status != RequestStatus.PENDING) throw new IllegalStateException("Only pending requests can be rejected");
        status = RequestStatus.REJECTED;
        rejectionReason = reason;
        updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getStudentId() { return studentId; }
    public String getStudentEmail() { return studentEmail; }
    public RequestStatus getStatus() { return status; }
    public String getRejectionReason() { return rejectionReason; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public List<RequestLine> getLines() { return lines; }
}
