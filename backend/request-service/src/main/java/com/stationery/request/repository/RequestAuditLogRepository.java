package com.stationery.request.repository;

import com.stationery.request.model.RequestAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

// Simple JPA repository for persisting audit log entries related to requests.
public interface RequestAuditLogRepository extends JpaRepository<RequestAuditLog, Long> {
}
