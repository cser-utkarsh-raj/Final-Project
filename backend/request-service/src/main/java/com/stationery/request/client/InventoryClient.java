package com.stationery.request.client;

import com.stationery.request.dto.RequestDtos.StockDeductionRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

// Feign client: calls inventory-service to deduct stock. When running in microservice env, discovery may be used instead of url.
@FeignClient(name = "inventory-service", url = "${inventory.service.url:http://localhost:8082}")
public interface InventoryClient {
    @PostMapping("/api/items/deduct")
    void deduct(@RequestBody StockDeductionRequest request);
}
