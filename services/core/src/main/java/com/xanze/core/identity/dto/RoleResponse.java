package com.xanze.core.identity.dto;

public record RoleResponse(
        Long id,
        String code,
        String name,
        String description,
        boolean enabled
) {
}

