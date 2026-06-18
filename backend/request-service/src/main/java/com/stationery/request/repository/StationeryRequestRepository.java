package com.stationery.request.repository;

import com.stationery.request.model.RequestStatus;
import com.stationery.request.model.StationeryRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StationeryRequestRepository extends JpaRepository<StationeryRequest, Long> {
    Page<StationeryRequest> findByStudentEmail(String studentEmail, Pageable pageable);
    Page<StationeryRequest> findByStudentEmailAndStatus(String studentEmail, RequestStatus status, Pageable pageable);
}
