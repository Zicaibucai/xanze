package com.xanze.core.auth;

import com.xanze.core.auth.dto.AuthResponse;
import com.xanze.core.auth.dto.LoginRequest;
import com.xanze.core.config.JwtProperties;
import com.xanze.core.identity.UserDirectoryService;
import com.xanze.core.identity.dto.UserResponse;
import com.xanze.core.security.CookieBearerTokenResolver;
import jakarta.validation.Valid;
import java.time.Duration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserDirectoryService userDirectoryService;
    private final JwtProperties jwtProperties;

    public AuthController(
            AuthService authService,
            UserDirectoryService userDirectoryService,
            JwtProperties jwtProperties
    ) {
        this.authService = authService;
        this.userDirectoryService = userDirectoryService;
        this.jwtProperties = jwtProperties;
    }

    @PostMapping("/login")
    ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthService.LoginResult result = authService.login(request);
        ResponseCookie cookie = ResponseCookie.from(
                        CookieBearerTokenResolver.COOKIE_NAME,
                        result.token().value()
                )
                .httpOnly(true)
                .secure(jwtProperties.secureCookie())
                .sameSite("Strict")
                .path("/")
                .maxAge(jwtProperties.ttl())
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new AuthResponse(result.user(), result.token().expiresAt()));
    }

    @PostMapping("/logout")
    ResponseEntity<Void> logout() {
        ResponseCookie cookie = ResponseCookie.from(CookieBearerTokenResolver.COOKIE_NAME, "")
                .httpOnly(true)
                .secure(jwtProperties.secureCookie())
                .sameSite("Strict")
                .path("/")
                .maxAge(Duration.ZERO)
                .build();
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    @GetMapping("/me")
    UserResponse me(Authentication authentication) {
        return userDirectoryService.requireByUsername(authentication.getName());
    }
}

