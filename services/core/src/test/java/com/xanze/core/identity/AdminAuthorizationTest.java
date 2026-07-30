package com.xanze.core.identity;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.xanze.core.config.SecurityConfig;
import com.xanze.core.security.CookieBearerTokenResolver;
import com.xanze.core.security.SecurityErrorWriter;
import com.xanze.core.web.RequestIdFilter;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AdminUserController.class)
@ContextConfiguration(classes = {
        AdminUserController.class,
        SecurityConfig.class,
        CookieBearerTokenResolver.class,
        SecurityErrorWriter.class,
        RequestIdFilter.class
})
class AdminAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdminIdentityService identityService;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Test
    void employeeCannotReadAdminUsers() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_EMPLOYEE")))
                        .header(RequestIdFilter.HEADER_NAME, "authorization-test"))
                .andExpect(status().isForbidden())
                .andExpect(header().string(RequestIdFilter.HEADER_NAME, "authorization-test"))
                .andExpect(jsonPath("$.request_id").value("authorization-test"))
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void adminCanReadAdminUsers() throws Exception {
        when(identityService.listUsers()).thenReturn(List.of());

        mockMvc.perform(get("/api/admin/users")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}

