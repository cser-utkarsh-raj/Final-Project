package com.stationery.request.model;

import jakarta.persistence.*;

@Entity
@Table(name = "request_lines")
public class RequestLine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // owning request (many lines -> one request)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private StationeryRequest request;
    @Column(nullable = false)
    private Long itemId;
    @Column(nullable = false)
    private String itemName;
    @Column(nullable = false)
    private int quantity;

    protected RequestLine() {}

    // Construct a request line associated with a parent StationeryRequest
    public RequestLine(StationeryRequest request, Long itemId, String itemName, int quantity) {
        this.request = request;
        this.itemId = itemId;
        this.itemName = itemName;
        this.quantity = quantity;
    }

    public Long getId() { return id; }
    public Long getItemId() { return itemId; }
    public String getItemName() { return itemName; }
    public int getQuantity() { return quantity; }
}
