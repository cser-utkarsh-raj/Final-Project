package com.stationery.inventory.service;

import com.stationery.inventory.dto.InventoryDtos.ItemRequest;
import com.stationery.inventory.model.Category;
import com.stationery.inventory.model.StationeryItem;
import com.stationery.inventory.repository.AuditLogRepository;
import com.stationery.inventory.repository.StationeryItemRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class InventoryServiceTest {
    private final StationeryItemRepository items = mock(StationeryItemRepository.class);
    private final AuditLogRepository audits = mock(AuditLogRepository.class);
    private final InventoryService service = new InventoryService(items, audits);

    @Test
    void createSavesItemAndAudit() {
        when(items.save(any())).thenReturn(new StationeryItem("Pen", Category.PEN, "piece", 10, 2));
        var response = service.create(new ItemRequest("Pen", Category.PEN, "piece", 10, 2), "admin@college.edu");
        assertEquals("Pen", response.name());
        verify(audits).save(any());
    }

    @Test
    void deductRejectsInsufficientStock() {
        when(items.findById(1L)).thenReturn(Optional.of(new StationeryItem("Paper", Category.PAPER, "ream", 1, 1)));
        assertThrows(IllegalStateException.class, () -> service.deduct(1L, 5, "admin@college.edu"));
    }
}
