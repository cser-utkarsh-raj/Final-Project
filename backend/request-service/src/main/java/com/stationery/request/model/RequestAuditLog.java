package com.stationery.request.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "request_audit_logs")
public class RequestAuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long requestId;
    private String action;
    private String actorEmail;
    @Column(length = 1000)
    private String details;
    private Instant createdAt = Instant.now();

    protected RequestAuditLog() {}

    public RequestAuditLog(Long requestId, String action, String actorEmail, String details) {
        this.requestId = requestId;
        this.action = action;
        this.actorEmail = actorEmail;
        this.details = details;
    }
}
