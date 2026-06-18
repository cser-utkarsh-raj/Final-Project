package com.stationery.inventory.controller;

import com.stationery.inventory.dto.InventoryDtos.ItemRequest;
import com.stationery.inventory.dto.InventoryDtos.ItemResponse;
import com.stationery.inventory.dto.InventoryDtos.StockDeductionRequest;
import com.stationery.inventory.service.InventoryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/items")
public class InventoryController {
    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    Page<ItemResponse> list(@RequestParam(defaultValue = "0") int page,
                            @RequestParam(defaultValue = "20") int size,
                            @RequestParam(defaultValue = "name") String sort) {
        return inventoryService.list(PageRequest.of(page, Math.min(size, 50), Sort.by(sort)));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    ItemResponse create(@Valid @RequestBody ItemRequest request, HttpServletRequest servletRequest) {
        return inventoryService.create(request, actor(servletRequest));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    ItemResponse update(@PathVariable Long id, @Valid @RequestBody ItemRequest request, HttpServletRequest servletRequest) {
        return inventoryService.update(id, request, actor(servletRequest));
    }

    @PostMapping("/deduct")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void deduct(@Valid @RequestBody StockDeductionRequest request, HttpServletRequest servletRequest) {
        inventoryService.deduct(request.itemId(), request.quantity(), actor(servletRequest));
    }

    private String actor(HttpServletRequest request) {
        Object actor = request.getAttribute("actorEmail");
        return actor == null ? "system" : actor.toString();
    }
}
