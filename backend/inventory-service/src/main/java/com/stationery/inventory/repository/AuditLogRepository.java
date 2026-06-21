package com.stationery.inventory.repository;

import com.stationery.inventory.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
}
// This interface extends JpaRepository, providing CRUD operations for the AuditLog entity. 
// It allows for easy interaction with the database to manage audit log records.
