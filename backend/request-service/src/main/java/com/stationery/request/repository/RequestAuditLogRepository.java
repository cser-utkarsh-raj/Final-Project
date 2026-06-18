package com.stationery.request.repository;

import com.stationery.request.model.RequestAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RequestAuditLogRepository extends JpaRepository<RequestAuditLog, Long> {
}
