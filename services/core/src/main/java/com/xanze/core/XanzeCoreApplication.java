package com.xanze.core;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
@MapperScan("com.xanze.core.identity.mapper")
public class XanzeCoreApplication {

    public static void main(String[] args) {
        SpringApplication.run(XanzeCoreApplication.class, args);
    }
}

