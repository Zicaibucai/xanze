package com.xanze.core.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "xanze.security.jwt")
public record JwtProperties(
        String issuer,
        String secret,
        Duration ttl,
        boolean secureCookie
) {
}

