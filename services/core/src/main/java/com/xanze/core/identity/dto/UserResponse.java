package com.xanze.core.identity.dto;

import java.util.List;

public record UserResponse(
        Long id,
        String username,
        String displayName,
        String email,
        boolean enabled,
        DepartmentResponse department,
        List<RoleResponse> roles
) {
    public boolean hasRole(String code) {
        return roles.stream().anyMatch(role -> role.code().equals(code));
    }
}

