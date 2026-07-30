package com.xanze.core.identity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateRoleRequest(
        @NotBlank
        @Pattern(regexp = "^[A-Za-z][A-Za-z0-9_]*$", message = "只能包含字母、数字或下划线")
        @Size(max = 64)
        String code,

        @NotBlank
        @Size(max = 128)
        String name,

        @Size(max = 255)
        String description
) {
}

