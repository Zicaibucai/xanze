package com.xanze.core.auth.dto;

import com.xanze.core.identity.dto.UserResponse;
import java.time.Instant;

public record AuthResponse(
        UserResponse user,
        Instant expiresAt
) {
}

