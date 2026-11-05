package com.iitsm.api.dto;

public record HealthResponse(
        String status,
        String service,
        String time
) {}

