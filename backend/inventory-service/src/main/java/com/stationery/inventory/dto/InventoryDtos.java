package com.stationery.inventory.dto;

import com.stationery.inventory.model.Category;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

// contains data transfer objects/DTOs for handling inventory-related requests and responses in the application
public class InventoryDtos {
    public record ItemRequest(
            @NotBlank String name,
            @NotNull Category category,
            @NotBlank String unit,
            @Min(0) int availableQuantity,
            @Min(0) int minimumQuantity
    ) {}

    //dto for item response, including item details and stock information
    public record ItemResponse(Long id, String name, Category category, String unit, int availableQuantity,
                               int minimumQuantity, boolean lowStock, Instant updatedAt) {}

    // they are used to handle requests for deducting stock from the inventory,including the item ID and the quantity to be deducted                  
    public record StockDeductionRequest(@NotNull Long itemId, @Min(1) int quantity) {}
}
