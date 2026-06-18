package com.stationery.request.dto;

import com.stationery.request.model.RequestStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.List;

public class RequestDtos {
    public record RequestLineInput(@NotNull Long itemId, @NotBlank String itemName, @Min(1) int quantity) {}
    public record SubmitRequest(@NotEmpty List<@Valid RequestLineInput> items) {}
    public record DecisionRequest(@NotBlank String reason) {}
    public record RequestLineResponse(Long itemId, String itemName, int quantity) {}
    public record RequestResponse(Long id, Long studentId, String studentEmail, RequestStatus status,
                                  String rejectionReason, Instant createdAt, List<RequestLineResponse> items) {}
    public record StockDeductionRequest(Long itemId, int quantity) {}
}
