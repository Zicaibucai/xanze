package com.xanze.core.identity;

import com.xanze.core.identity.dto.CreateDepartmentRequest;
import com.xanze.core.identity.dto.DepartmentResponse;
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
@RequestMapping("/api/admin/departments")
public class AdminDepartmentController {

    private final AdminIdentityService identityService;

    public AdminDepartmentController(AdminIdentityService identityService) {
        this.identityService = identityService;
    }

    @GetMapping
    List<DepartmentResponse> list() {
        return identityService.listDepartments();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    DepartmentResponse create(@Valid @RequestBody CreateDepartmentRequest request) {
        return identityService.createDepartment(request);
    }
}

