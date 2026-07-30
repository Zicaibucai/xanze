package com.xanze.core.seed;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.xanze.core.config.SeedProperties;
import com.xanze.core.identity.mapper.DepartmentMapper;
import com.xanze.core.identity.mapper.RoleMapper;
import com.xanze.core.identity.mapper.UserMapper;
import com.xanze.core.identity.mapper.UserRoleMapper;
import com.xanze.core.identity.model.Department;
import com.xanze.core.identity.model.Role;
import com.xanze.core.identity.model.User;
import com.xanze.core.identity.model.UserRole;
import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Component
public class DevelopmentSeedRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DevelopmentSeedRunner.class);

    private final SeedProperties properties;
    private final DepartmentMapper departmentMapper;
    private final RoleMapper roleMapper;
    private final UserMapper userMapper;
    private final UserRoleMapper userRoleMapper;
    private final PasswordEncoder passwordEncoder;

    public DevelopmentSeedRunner(
            SeedProperties properties,
            DepartmentMapper departmentMapper,
            RoleMapper roleMapper,
            UserMapper userMapper,
            UserRoleMapper userRoleMapper,
            PasswordEncoder passwordEncoder
    ) {
        this.properties = properties;
        this.departmentMapper = departmentMapper;
        this.roleMapper = roleMapper;
        this.userMapper = userMapper;
        this.userRoleMapper = userRoleMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!properties.enabled()) {
            return;
        }
        requireSeedValue(properties.adminUsername(), "XANZE_DEV_ADMIN_USERNAME");
        requireSeedValue(properties.adminPassword(), "XANZE_DEV_ADMIN_PASSWORD");
        requireSeedValue(properties.employeeUsername(), "XANZE_DEV_EMPLOYEE_USERNAME");
        requireSeedValue(properties.employeePassword(), "XANZE_DEV_EMPLOYEE_PASSWORD");

        Department department = ensureDepartment();
        Role adminRole = ensureRole("ADMIN", "系统管理员", "管理用户、角色和部门");
        Role employeeRole = ensureRole("EMPLOYEE", "普通员工", "访问员工门户");

        ensureUser(
                properties.adminUsername(),
                properties.adminPassword(),
                "系统管理员",
                department,
                adminRole
        );
        ensureUser(
                properties.employeeUsername(),
                properties.employeePassword(),
                "开发员工",
                department,
                employeeRole
        );
        log.info("Development identity seed is ready");
    }

    private Department ensureDepartment() {
        Department department = departmentMapper.selectOne(
                new LambdaQueryWrapper<Department>().eq(Department::getCode, "GENERAL")
        );
        if (department != null) {
            return department;
        }
        LocalDateTime now = LocalDateTime.now();
        department = new Department();
        department.setCode("GENERAL");
        department.setName("综合管理部");
        department.setEnabled(true);
        department.setCreatedAt(now);
        department.setUpdatedAt(now);
        departmentMapper.insert(department);
        return department;
    }

    private Role ensureRole(String code, String name, String description) {
        Role role = roleMapper.selectOne(new LambdaQueryWrapper<Role>().eq(Role::getCode, code));
        if (role != null) {
            return role;
        }
        LocalDateTime now = LocalDateTime.now();
        role = new Role();
        role.setCode(code);
        role.setName(name);
        role.setDescription(description);
        role.setEnabled(true);
        role.setCreatedAt(now);
        role.setUpdatedAt(now);
        roleMapper.insert(role);
        return role;
    }

    private void ensureUser(
            String username,
            String password,
            String displayName,
            Department department,
            Role role
    ) {
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getUsername, username)
        );
        if (user == null) {
            LocalDateTime now = LocalDateTime.now();
            user = new User();
            user.setUsername(username);
            user.setPasswordHash(passwordEncoder.encode(password));
            user.setDisplayName(displayName);
            user.setDepartmentId(department.getId());
            user.setEnabled(true);
            user.setCreatedAt(now);
            user.setUpdatedAt(now);
            userMapper.insert(user);
        }

        long relationCount = userRoleMapper.selectCount(new LambdaQueryWrapper<UserRole>()
                .eq(UserRole::getUserId, user.getId())
                .eq(UserRole::getRoleId, role.getId()));
        if (relationCount == 0) {
            UserRole relation = new UserRole();
            relation.setUserId(user.getId());
            relation.setRoleId(role.getId());
            relation.setCreatedAt(LocalDateTime.now());
            userRoleMapper.insert(relation);
        }
    }

    private void requireSeedValue(String value, String environmentVariable) {
        if (!StringUtils.hasText(value)) {
            throw new IllegalStateException(environmentVariable + " is required when development seed is enabled");
        }
    }
}

