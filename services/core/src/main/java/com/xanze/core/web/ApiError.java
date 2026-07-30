package com.xanze.core.web;

import java.time.Instant;
import java.util.Map;

public record ApiError(
        String requestId,
        String code,
        String message,
        Map<String, String> details,
        Instant timestamp
) {
}

