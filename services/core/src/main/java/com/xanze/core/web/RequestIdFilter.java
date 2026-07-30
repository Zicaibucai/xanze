package com.xanze.core.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestIdFilter extends OncePerRequestFilter {

    public static final String HEADER_NAME = "X-Request-ID";
    public static final String ATTRIBUTE_NAME = "xanze.request_id";
    private static final int MAX_REQUEST_ID_LENGTH = 128;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String requestId = normalize(request.getHeader(HEADER_NAME));
        request.setAttribute(ATTRIBUTE_NAME, requestId);
        response.setHeader(HEADER_NAME, requestId);
        MDC.put("request_id", requestId);
        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove("request_id");
        }
    }

    private String normalize(String value) {
        if (!StringUtils.hasText(value) || value.length() > MAX_REQUEST_ID_LENGTH) {
            return UUID.randomUUID().toString();
        }
        return value.replaceAll("[^A-Za-z0-9._:-]", "_");
    }

    public static String current(HttpServletRequest request) {
        Object requestId = request.getAttribute(ATTRIBUTE_NAME);
        return requestId == null ? UUID.randomUUID().toString() : requestId.toString();
    }
}

