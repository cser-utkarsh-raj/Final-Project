package com.stationery.inventory.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "stationery_items")
// represents a stationery item in the inventory system, including its properties and behavior
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

    protected StationeryItem() {} // default constructor for JPA

    //creates a new stationery item with the specified name, category, unit, available quantity, and minimum quantity, and sets the updatedAt timestamp to the current time
    public StationeryItem(String name, Category category, String unit, int availableQuantity, int minimumQuantity) {
        this.name = name;
        this.category = category;
        this.unit = unit;
        this.availableQuantity = availableQuantity;
        this.minimumQuantity = minimumQuantity;
    }

    // updates the properties of the stationery item, including its name, category, unit, available quantity, and minimum quantity, and also updates the timestamp to reflect the last modification time
    public void update(String name, Category category, String unit, int availableQuantity, int minimumQuantity) {
        this.name = name;
        this.category = category;
        this.unit = unit;
        this.availableQuantity = availableQuantity;
        this.minimumQuantity = minimumQuantity;
        this.updatedAt = Instant.now();
    }

    // deducts a specified quantity from the available stock of the stationery item, ensuring that the quantity is valid and that there is enough stock available before performing the deduction
    public void deduct(int quantity) {
        if (quantity <= 0) throw new IllegalArgumentException("Quantity must be greater than zero");
        if (availableQuantity < quantity) throw new IllegalStateException("Not enough stock available");
        availableQuantity -= quantity;
        updatedAt = Instant.now();
    }

    // getters for the fields of the StationeryItem class, allowing other parts of the application to access the item's properties
    public Long getId() { return id; }
    public String getName() { return name; }
    public Category getCategory() { return category; }
    public String getUnit() { return unit; }
    public int getAvailableQuantity() { return availableQuantity; }
    public int getMinimumQuantity() { return minimumQuantity; }
    public boolean isLowStock() { return availableQuantity <= minimumQuantity; }
    public Instant getUpdatedAt() { return updatedAt; }
}
