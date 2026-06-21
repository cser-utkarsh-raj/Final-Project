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

    // allows the inventory service to interact with the stationery item repository for managing inventory items and the audit log repository for recording actions performed on the inventory
    public InventoryService(StationeryItemRepository items, AuditLogRepository audits) {
        this.items = items;
        this.audits = audits;
    }

    //finds all stationery items in the inventory with pagination and sorting
    public Page<ItemResponse> list(Pageable pageable) {
        return items.findAll(pageable).map(this::toResponse);
    }

    // creates a new stationery item in the inventory, logs the creation action in the audit log, and returns the created item as a response
    @Transactional
    public ItemResponse create(ItemRequest request, String actor) {
        StationeryItem saved = items.save(new StationeryItem(request.name(), request.category(), request.unit(),
                request.availableQuantity(), request.minimumQuantity()));
        audits.save(new AuditLog("ITEM_CREATED", actor, saved.getId(), saved.getName()));
        return toResponse(saved);
    }

    // updates the details of an existing stationery item, logs the update action in the audit log, and returns the updated item as a response
    @Transactional
    public ItemResponse update(Long id, ItemRequest request, String actor) {
        StationeryItem item = get(id);
        item.update(request.name(), request.category(), request.unit(), request.availableQuantity(), request.minimumQuantity());
        audits.save(new AuditLog("ITEM_UPDATED", actor, item.getId(), item.getName()));
        return toResponse(item);
    }

    // deducts certain quantity of stock from a stationery item, logs the deduction in the audit log, and ensures that the operation is performed within a transactional context to maintain data integrity
    @Transactional 
    public void deduct(Long id, int quantity, String actor) {
        StationeryItem item = get(id);
        item.deduct(quantity);
        audits.save(new AuditLog("STOCK_DEDUCTED", actor, item.getId(), "Quantity: " + quantity));
    }

    // checks if a stationery item with the given ID exists in the repository. If it does, it returns the item; otherwise, it throws an EntityNotFoundException with a message indicating that the item was not found.
    private StationeryItem get(Long id) {
        return items.findById(id).orElseThrow(() -> new EntityNotFoundException("Stationery item not found"));
    }

    // converts a StationeryItem entity to an ItemResponse DTO, which is used to send item details in the response body of API requests
    private ItemResponse toResponse(StationeryItem item) {
        return new ItemResponse(item.getId(), item.getName(), item.getCategory(), item.getUnit(),
                item.getAvailableQuantity(), item.getMinimumQuantity(), item.isLowStock(), item.getUpdatedAt());
    }
}
