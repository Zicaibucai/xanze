package com.xanze.core.auth;

import com.xanze.core.auth.dto.LoginRequest;
import com.xanze.core.identity.UserDirectoryService;
import com.xanze.core.identity.dto.UserResponse;
import com.xanze.core.identity.model.User;
import com.xanze.core.web.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserDirectoryService userDirectoryService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserDirectoryService userDirectoryService,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userDirectoryService = userDirectoryService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResult login(LoginRequest request) {
        User user;
        try {
            user = userDirectoryService.findEntityByUsername(request.username());
        } catch (BusinessException exception) {
            throw invalidCredentials();
        }
        if (!Boolean.TRUE.equals(user.getEnabled())
                || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw invalidCredentials();
        }
        UserResponse response = userDirectoryService.toResponse(user);
        JwtService.IssuedToken token = jwtService.issue(response);
        return new LoginResult(response, token);
    }

    private BusinessException invalidCredentials() {
        return new BusinessException(
                HttpStatus.UNAUTHORIZED,
                "AUTH_INVALID_CREDENTIALS",
                "用户名或密码错误"
        );
    }

    public record LoginResult(UserResponse user, JwtService.IssuedToken token) {
    }
}

