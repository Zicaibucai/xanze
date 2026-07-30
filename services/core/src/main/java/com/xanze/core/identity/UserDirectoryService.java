package com.xanze.core.identity;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.xanze.core.identity.dto.DepartmentResponse;
import com.xanze.core.identity.dto.RoleResponse;
import com.xanze.core.identity.dto.UserResponse;
import com.xanze.core.identity.mapper.DepartmentMapper;
import com.xanze.core.identity.mapper.RoleMapper;
import com.xanze.core.identity.mapper.UserMapper;
import com.xanze.core.identity.model.Department;
import com.xanze.core.identity.model.Role;
import com.xanze.core.identity.model.User;
import com.xanze.core.web.BusinessException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class UserDirectoryService {

    private final UserMapper userMapper;
    private final DepartmentMapper departmentMapper;
    private final RoleMapper roleMapper;

    public UserDirectoryService(
            UserMapper userMapper,
            DepartmentMapper departmentMapper,
            RoleMapper roleMapper
    ) {
        this.userMapper = userMapper;
        this.departmentMapper = departmentMapper;
        this.roleMapper = roleMapper;
    }

    public User findEntityByUsername(String username) {
        User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getUsername, username));
        if (user == null) {
            throw new BusinessException(
                    HttpStatus.NOT_FOUND,
                    "USER_NOT_FOUND",
                    "用户不存在"
            );
        }
        return user;
    }

    public UserResponse requireByUsername(String username) {
        return toResponse(findEntityByUsername(username));
    }

    public UserResponse toResponse(User user) {
        DepartmentResponse department = null;
        if (user.getDepartmentId() != null) {
            Department entity = departmentMapper.selectById(user.getDepartmentId());
            if (entity != null) {
                department = toResponse(entity);
            }
        }
        List<RoleResponse> roles = roleMapper.findEnabledByUserId(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getDisplayName(),
                user.getEmail(),
                Boolean.TRUE.equals(user.getEnabled()),
                department,
                roles
        );
    }

    public RoleResponse toResponse(Role role) {
        return new RoleResponse(
                role.getId(),
                role.getCode(),
                role.getName(),
                role.getDescription(),
                Boolean.TRUE.equals(role.getEnabled())
        );
    }

    public DepartmentResponse toResponse(Department department) {
        return new DepartmentResponse(
                department.getId(),
                department.getCode(),
                department.getName(),
                Boolean.TRUE.equals(department.getEnabled())
        );
    }
}

