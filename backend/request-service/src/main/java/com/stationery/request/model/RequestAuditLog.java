package com.stationery.request.model;

import jakarta.persistence.*;
import java.time.Instant;

// Audit entry for request lifecycle events (submitted/approved/rejected).
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

    // Create an audit log referencing the request id, action name, actor and optional details
    public RequestAuditLog(Long requestId, String action, String actorEmail, String details) {
        this.requestId = requestId;
        this.action = action;
        this.actorEmail = actorEmail;
        this.details = details;
    }
}
