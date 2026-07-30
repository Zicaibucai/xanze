package com.xanze.core.identity.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreateUserRequest(
        @NotBlank
        @Pattern(regexp = "^[A-Za-z][A-Za-z0-9._-]*$", message = "用户名格式不正确")
        @Size(max = 64)
        String username,

        @NotBlank
        @Size(min = 8, max = 72)
        String password,

        @NotBlank
        @Size(max = 128)
        String displayName,

        @Email
        @Size(max = 255)
        String email,

        @NotNull
        Long departmentId,

        @NotEmpty
        List<@NotNull Long> roleIds
) {
}

