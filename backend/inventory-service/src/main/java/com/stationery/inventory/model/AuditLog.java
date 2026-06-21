package com.stationery.inventory.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity 
@Table(name = "audit_logs")

// has details about actions performed in the inventory system, such as adding or removing items, including who performed the action and when it occurred
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

    protected AuditLog() {} // default constructor for JPA

    // when something happens in the inventory system, such as adding or removing an item, this class is used to record the action, who performed it, and any relevant details for auditing purposes
    public AuditLog(String action, String actorEmail, Long itemId, String details) {
        this.action = action;
        this.actorEmail = actorEmail;
        this.itemId = itemId;
        this.details = details;
    }
}
