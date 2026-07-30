package com.xanze.core.identity;

import com.xanze.core.identity.dto.CreateUserRequest;
import com.xanze.core.identity.dto.UserResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminIdentityService identityService;

    public AdminUserController(AdminIdentityService identityService) {
        this.identityService = identityService;
    }

    @GetMapping
    List<UserResponse> list() {
        return identityService.listUsers();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    UserResponse create(@Valid @RequestBody CreateUserRequest request) {
        return identityService.createUser(request);
    }
}

