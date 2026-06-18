package com.stationery.inventory.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "stationery_items")
public class StationeryItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;
    @Column(nullable = false)
    private String unit;
    @Column(nullable = false)
    private int availableQuantity;
    @Column(nullable = false)
    private int minimumQuantity;
    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    protected StationeryItem() {}

    public StationeryItem(String name, Category category, String unit, int availableQuantity, int minimumQuantity) {
        this.name = name;
        this.category = category;
        this.unit = unit;
        this.availableQuantity = availableQuantity;
        this.minimumQuantity = minimumQuantity;
    }

    public void update(String name, Category category, String unit, int availableQuantity, int minimumQuantity) {
        this.name = name;
        this.category = category;
        this.unit = unit;
        this.availableQuantity = availableQuantity;
        this.minimumQuantity = minimumQuantity;
        this.updatedAt = Instant.now();
    }

    public void deduct(int quantity) {
        if (quantity <= 0) throw new IllegalArgumentException("Quantity must be greater than zero");
        if (availableQuantity < quantity) throw new IllegalStateException("Not enough stock available");
        availableQuantity -= quantity;
        updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public Category getCategory() { return category; }
    public String getUnit() { return unit; }
    public int getAvailableQuantity() { return availableQuantity; }
    public int getMinimumQuantity() { return minimumQuantity; }
    public boolean isLowStock() { return availableQuantity <= minimumQuantity; }
    public Instant getUpdatedAt() { return updatedAt; }
}
