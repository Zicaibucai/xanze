package com.xanze.core.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.xanze.core.web.ApiError;
import com.xanze.core.web.RequestIdFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

@Component
public class SecurityErrorWriter {

    private final ObjectMapper objectMapper;

    public SecurityErrorWriter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void unauthorized(HttpServletRequest request, HttpServletResponse response) throws IOException {
        write(request, response, HttpServletResponse.SC_UNAUTHORIZED, "UNAUTHORIZED", "请先登录");
    }

    public void forbidden(HttpServletRequest request, HttpServletResponse response) throws IOException {
        write(request, response, HttpServletResponse.SC_FORBIDDEN, "FORBIDDEN", "无权访问该资源");
    }

    private void write(
            HttpServletRequest request,
            HttpServletResponse response,
            int status,
            String code,
            String message
    ) throws IOException {
        response.setStatus(status);
        response.setCharacterEncoding("UTF-8");
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), new ApiError(
                RequestIdFilter.current(request),
                code,
                message,
                null,
                Instant.now()
        ));
    }
}

