package com.stationery.request.service;

import com.stationery.request.client.InventoryClient;
import com.stationery.request.dto.RequestDtos.RequestLineInput;
import com.stationery.request.dto.RequestDtos.SubmitRequest;
import com.stationery.request.model.StationeryRequest;
import com.stationery.request.repository.RequestAuditLogRepository;
import com.stationery.request.repository.StationeryRequestRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class StationeryRequestServiceTest {
    private final StationeryRequestRepository requests = mock(StationeryRequestRepository.class);
    private final RequestAuditLogRepository audits = mock(RequestAuditLogRepository.class);
    private final InventoryClient inventory = mock(InventoryClient.class);
    private final StationeryRequestService service = new StationeryRequestService(requests, audits, inventory);

    @Test
    void submitCreatesPendingRequest() {
        when(requests.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        var response = service.submit(new SubmitRequest(List.of(new RequestLineInput(1L, "Pen", 2))), 10L, "student@college.edu");
        assertEquals("student@college.edu", response.studentEmail());
        assertEquals(1, response.items().size());
        verify(audits).save(any());
    }

    @Test
    void approveDeductsEachLine() {
        StationeryRequest request = new StationeryRequest(10L, "student@college.edu");
        request.addLine(1L, "Pen", 2);
        when(requests.findById(5L)).thenReturn(Optional.of(request));
        service.approve(5L, "admin@college.edu");
        verify(inventory).deduct(any());
    }
}
