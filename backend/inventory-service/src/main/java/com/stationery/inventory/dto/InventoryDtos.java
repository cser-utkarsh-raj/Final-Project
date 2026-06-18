package com.stationery.inventory.dto;

import com.stationery.inventory.model.Category;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public class InventoryDtos {
    public record ItemRequest(
            @NotBlank String name,
            @NotNull Category category,
            @NotBlank String unit,
            @Min(0) int availableQuantity,
            @Min(0) int minimumQuantity
    ) {}

    public record ItemResponse(Long id, String name, Category category, String unit, int availableQuantity,
                               int minimumQuantity, boolean lowStock, Instant updatedAt) {}

    public record StockDeductionRequest(@NotNull Long itemId, @Min(1) int quantity) {}
}
