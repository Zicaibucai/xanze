package com.xanze.core.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "xanze.seed")
public record SeedProperties(
        boolean enabled,
        String adminUsername,
        String adminPassword,
        String employeeUsername,
        String employeePassword
) {
}

