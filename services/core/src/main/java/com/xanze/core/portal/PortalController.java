package com.xanze.core.portal;

import com.xanze.core.identity.UserDirectoryService;
import com.xanze.core.identity.dto.UserResponse;
import java.time.Instant;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/portal")
public class PortalController {

    private final UserDirectoryService userDirectoryService;

    public PortalController(UserDirectoryService userDirectoryService) {
        this.userDirectoryService = userDirectoryService;
    }

    @GetMapping("/context")
    PortalContext context(Authentication authentication) {
        return new PortalContext(
                userDirectoryService.requireByUsername(authentication.getName()),
                Instant.now()
        );
    }

    public record PortalContext(UserResponse user, Instant serverTime) {
    }
}

