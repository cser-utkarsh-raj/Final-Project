package com.stationery.inventory.service;

import com.stationery.inventory.dto.InventoryDtos.ItemRequest;
import com.stationery.inventory.dto.InventoryDtos.ItemResponse;
import com.stationery.inventory.model.AuditLog;
import com.stationery.inventory.model.StationeryItem;
import com.stationery.inventory.repository.AuditLogRepository;
import com.stationery.inventory.repository.StationeryItemRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryService {
    private final StationeryItemRepository items;
    private final AuditLogRepository audits;

    public InventoryService(StationeryItemRepository items, AuditLogRepository audits) {
        this.items = items;
        this.audits = audits;
    }

    public Page<ItemResponse> list(Pageable pageable) {
        return items.findAll(pageable).map(this::toResponse);
    }

    @Transactional
    public ItemResponse create(ItemRequest request, String actor) {
        StationeryItem saved = items.save(new StationeryItem(request.name(), request.category(), request.unit(),
                request.availableQuantity(), request.minimumQuantity()));
        audits.save(new AuditLog("ITEM_CREATED", actor, saved.getId(), saved.getName()));
        return toResponse(saved);
    }

    @Transactional
    public ItemResponse update(Long id, ItemRequest request, String actor) {
        StationeryItem item = get(id);
        item.update(request.name(), request.category(), request.unit(), request.availableQuantity(), request.minimumQuantity());
        audits.save(new AuditLog("ITEM_UPDATED", actor, item.getId(), item.getName()));
        return toResponse(item);
    }

    @Transactional
    public void deduct(Long id, int quantity, String actor) {
        StationeryItem item = get(id);
        item.deduct(quantity);
        audits.save(new AuditLog("STOCK_DEDUCTED", actor, item.getId(), "Quantity: " + quantity));
    }

    private StationeryItem get(Long id) {
        return items.findById(id).orElseThrow(() -> new EntityNotFoundException("Stationery item not found"));
    }

    private ItemResponse toResponse(StationeryItem item) {
        return new ItemResponse(item.getId(), item.getName(), item.getCategory(), item.getUnit(),
                item.getAvailableQuantity(), item.getMinimumQuantity(), item.isLowStock(), item.getUpdatedAt());
    }
}
