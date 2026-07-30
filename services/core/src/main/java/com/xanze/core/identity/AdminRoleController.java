package com.xanze.core.identity;

import com.xanze.core.identity.dto.CreateRoleRequest;
import com.xanze.core.identity.dto.RoleResponse;
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
@RequestMapping("/api/admin/roles")
public class AdminRoleController {

    private final AdminIdentityService identityService;

    public AdminRoleController(AdminIdentityService identityService) {
        this.identityService = identityService;
    }

    @GetMapping
    List<RoleResponse> list() {
        return identityService.listRoles();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    RoleResponse create(@Valid @RequestBody CreateRoleRequest request) {
        return identityService.createRole(request);
    }
}

