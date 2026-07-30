package com.xanze.core.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI xanzeOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Xanze Core API")
                .version("0.1.0")
                .description("Xanze 阶段 1：身份、组织、认证与权限 API"));
    }
}

