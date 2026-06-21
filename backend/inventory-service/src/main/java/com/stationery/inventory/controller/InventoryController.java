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

//this class handles HTTP requests related to inventory management, such as listing items, creating new items, updating existing items, and deducting stock from the inventory
@RestController 
@RequestMapping("/api/items")
public class InventoryController {
    private final InventoryService inventoryService;

// allows the controller to use the inventory service to handle requests related to inventory management
    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    // for listing items in the inventory with pagination and sorting
    @GetMapping
    Page<ItemResponse> list(@RequestParam(name = "page", defaultValue = "0") int page,
                            @RequestParam(name = "size", defaultValue = "20") int size,
                            @RequestParam(name = "sort", defaultValue = "name") String sort) {
        return inventoryService.list(PageRequest.of(page, Math.min(size, 50), Sort.by(sort)));
    }
// only admin can create new items in the inventory,and the method returns the created item in the response body
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    ItemResponse create(@Valid @RequestBody ItemRequest request, HttpServletRequest servletRequest) {
        return inventoryService.create(request, actor(servletRequest));
    }
// only admin can update items in the inventory,and the method returns the updated item in the response body
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    ItemResponse update(@PathVariable Long id, @Valid @RequestBody ItemRequest request, HttpServletRequest servletRequest) {
        return inventoryService.update(id, request, actor(servletRequest));
    }
// only admin can deduct stock from the inventory,the method returns no content in the response body
    @PostMapping("/deduct")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void deduct(@Valid @RequestBody StockDeductionRequest request, HttpServletRequest servletRequest) {
        inventoryService.deduct(request.itemId(), request.quantity(), actor(servletRequest));
    }
// gets the email of the actor/user making the request from the HttpServletRequest object.If no actor is found, it defaults to "system".
    private String actor(HttpServletRequest request) {
        Object actor = request.getAttribute("actorEmail");
        return actor == null ? "system" : actor.toString();
    }
}
