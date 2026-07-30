package com.xanze.core.identity.dto;

public record DepartmentResponse(
        Long id,
        String code,
        String name,
        boolean enabled
) {
}

