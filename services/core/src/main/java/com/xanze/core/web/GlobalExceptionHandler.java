package com.xanze.core.web;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BusinessException.class)
    ResponseEntity<ApiError> handleBusiness(BusinessException exception, HttpServletRequest request) {
        return error(
                exception.getStatus(),
                exception.getCode(),
                exception.getMessage(),
                null,
                request
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> handleValidation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {
        Map<String, String> details = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors().forEach(
                error -> details.putIfAbsent(error.getField(), error.getDefaultMessage())
        );
        return error(
                HttpStatus.BAD_REQUEST,
                "VALIDATION_FAILED",
                "请求参数校验失败",
                details,
                request
        );
    }

    @ExceptionHandler(ConstraintViolationException.class)
    ResponseEntity<ApiError> handleConstraint(
            ConstraintViolationException exception,
            HttpServletRequest request
    ) {
        Map<String, String> details = new LinkedHashMap<>();
        exception.getConstraintViolations().forEach(
                violation -> details.put(violation.getPropertyPath().toString(), violation.getMessage())
        );
        return error(
                HttpStatus.BAD_REQUEST,
                "VALIDATION_FAILED",
                "请求参数校验失败",
                details,
                request
        );
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ApiError> handleConflict(
            DataIntegrityViolationException exception,
            HttpServletRequest request
    ) {
        return error(
                HttpStatus.CONFLICT,
                "RESOURCE_CONFLICT",
                "数据已存在或仍被其他记录使用",
                null,
                request
        );
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiError> handleUnexpected(Exception exception, HttpServletRequest request) {
        String requestId = RequestIdFilter.current(request);
        log.error("Unhandled request error, request_id={}", requestId, exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiError(
                requestId,
                "INTERNAL_ERROR",
                "服务暂时不可用",
                null,
                Instant.now()
        ));
    }

    private ResponseEntity<ApiError> error(
            HttpStatus status,
            String code,
            String message,
            Map<String, String> details,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(status).body(new ApiError(
                RequestIdFilter.current(request),
                code,
                message,
                details,
                Instant.now()
        ));
    }
}

