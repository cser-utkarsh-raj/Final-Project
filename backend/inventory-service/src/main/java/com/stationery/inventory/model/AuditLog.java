package com.stationery.inventory.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String action;
    private String actorEmail;
    private Long itemId;
    @Column(length = 1000)
    private String details;
    private Instant createdAt = Instant.now();

    protected AuditLog() {}

    public AuditLog(String action, String actorEmail, Long itemId, String details) {
        this.action = action;
        this.actorEmail = actorEmail;
        this.itemId = itemId;
        this.details = details;
    }
}
