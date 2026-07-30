package com.xanze.core.identity.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xanze.core.identity.model.Role;
import java.util.List;
import org.apache.ibatis.annotations.Select;

public interface RoleMapper extends BaseMapper<Role> {

    @Select("""
            SELECT r.*
            FROM xz_role r
            JOIN xz_user_role ur ON ur.role_id = r.id
            WHERE ur.user_id = #{userId} AND r.enabled = 1
            ORDER BY r.id
            """)
    List<Role> findEnabledByUserId(Long userId);
}

