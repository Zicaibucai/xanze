package com.xanze.core.identity;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.xanze.core.identity.dto.CreateDepartmentRequest;
import com.xanze.core.identity.dto.CreateRoleRequest;
import com.xanze.core.identity.dto.CreateUserRequest;
import com.xanze.core.identity.dto.DepartmentResponse;
import com.xanze.core.identity.dto.RoleResponse;
import com.xanze.core.identity.dto.UserResponse;
import com.xanze.core.identity.mapper.DepartmentMapper;
import com.xanze.core.identity.mapper.RoleMapper;
import com.xanze.core.identity.mapper.UserMapper;
import com.xanze.core.identity.mapper.UserRoleMapper;
import com.xanze.core.identity.model.Department;
import com.xanze.core.identity.model.Role;
import com.xanze.core.identity.model.User;
import com.xanze.core.identity.model.UserRole;
import com.xanze.core.web.BusinessException;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminIdentityService {

    private final UserMapper userMapper;
    private final RoleMapper roleMapper;
    private final DepartmentMapper departmentMapper;
    private final UserRoleMapper userRoleMapper;
    private final UserDirectoryService directoryService;
    private final PasswordEncoder passwordEncoder;

    public AdminIdentityService(
            UserMapper userMapper,
            RoleMapper roleMapper,
            DepartmentMapper departmentMapper,
            UserRoleMapper userRoleMapper,
            UserDirectoryService directoryService,
            PasswordEncoder passwordEncoder
    ) {
        this.userMapper = userMapper;
        this.roleMapper = roleMapper;
        this.departmentMapper = departmentMapper;
        this.userRoleMapper = userRoleMapper;
        this.directoryService = directoryService;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserResponse> listUsers() {
        return userMapper.selectList(new LambdaQueryWrapper<User>().orderByAsc(User::getId))
                .stream()
                .map(directoryService::toResponse)
                .toList();
    }

    public List<RoleResponse> listRoles() {
        return roleMapper.selectList(new LambdaQueryWrapper<Role>().orderByAsc(Role::getId))
                .stream()
                .map(directoryService::toResponse)
                .toList();
    }

    public List<DepartmentResponse> listDepartments() {
        return departmentMapper.selectList(
                        new LambdaQueryWrapper<Department>().orderByAsc(Department::getId)
                )
                .stream()
                .map(directoryService::toResponse)
                .toList();
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        long existing = userMapper.selectCount(new LambdaQueryWrapper<User>()
                .eq(User::getUsername, request.username()));
        if (existing > 0) {
            throw new BusinessException(
                    HttpStatus.CONFLICT,
                    "USERNAME_ALREADY_EXISTS",
                    "用户名已存在"
            );
        }

        Department department = departmentMapper.selectById(request.departmentId());
        if (department == null || !Boolean.TRUE.equals(department.getEnabled())) {
            throw new BusinessException(
                    HttpStatus.BAD_REQUEST,
                    "DEPARTMENT_NOT_AVAILABLE",
                    "所选部门不存在或已停用"
            );
        }

        Set<Long> roleIds = new LinkedHashSet<>(request.roleIds());
        List<Role> roles = roleMapper.selectBatchIds(roleIds);
        if (roles.size() != roleIds.size()
                || roles.stream().anyMatch(role -> !Boolean.TRUE.equals(role.getEnabled()))) {
            throw new BusinessException(
                    HttpStatus.BAD_REQUEST,
                    "ROLE_NOT_AVAILABLE",
                    "所选角色不存在或已停用"
            );
        }

        LocalDateTime now = LocalDateTime.now();
        User user = new User();
        user.setUsername(request.username());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setDisplayName(request.displayName());
        user.setEmail(blankToNull(request.email()));
        user.setDepartmentId(department.getId());
        user.setEnabled(true);
        user.setCreatedAt(now);
        user.setUpdatedAt(now);
        userMapper.insert(user);

        roleIds.forEach(roleId -> {
            UserRole relation = new UserRole();
            relation.setUserId(user.getId());
            relation.setRoleId(roleId);
            relation.setCreatedAt(now);
            userRoleMapper.insert(relation);
        });
        return directoryService.toResponse(user);
    }

    @Transactional
    public RoleResponse createRole(CreateRoleRequest request) {
        String code = request.code().toUpperCase(Locale.ROOT);
        if (roleMapper.selectCount(new LambdaQueryWrapper<Role>().eq(Role::getCode, code)) > 0) {
            throw new BusinessException(HttpStatus.CONFLICT, "ROLE_CODE_EXISTS", "角色编码已存在");
        }
        LocalDateTime now = LocalDateTime.now();
        Role role = new Role();
        role.setCode(code);
        role.setName(request.name());
        role.setDescription(blankToNull(request.description()));
        role.setEnabled(true);
        role.setCreatedAt(now);
        role.setUpdatedAt(now);
        roleMapper.insert(role);
        return directoryService.toResponse(role);
    }

    @Transactional
    public DepartmentResponse createDepartment(CreateDepartmentRequest request) {
        String code = request.code().toUpperCase(Locale.ROOT);
        if (departmentMapper.selectCount(
                new LambdaQueryWrapper<Department>().eq(Department::getCode, code)
        ) > 0) {
            throw new BusinessException(
                    HttpStatus.CONFLICT,
                    "DEPARTMENT_CODE_EXISTS",
                    "部门编码已存在"
            );
        }
        LocalDateTime now = LocalDateTime.now();
        Department department = new Department();
        department.setCode(code);
        department.setName(request.name());
        department.setEnabled(true);
        department.setCreatedAt(now);
        department.setUpdatedAt(now);
        departmentMapper.insert(department);
        return directoryService.toResponse(department);
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}

