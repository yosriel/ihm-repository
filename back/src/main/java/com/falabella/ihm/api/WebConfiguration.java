package com.falabella.ihm.api;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfiguration implements WebMvcConfigurer {
    private final String[] origins;

    public WebConfiguration(@Value("${app.frontend-origins:http://localhost:5173}") String origins) {
        this.origins = Arrays.stream(origins.split(",")).map(String::strip)
            .filter(value -> !value.isEmpty()).toArray(String[]::new);
        if (Arrays.stream(this.origins).anyMatch(value -> value.contains("*"))) {
            throw new IllegalArgumentException("FRONTEND_ORIGINS requiere orígenes explícitos.");
        }
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**").allowedOrigins(origins)
            .allowedMethods("GET", "POST", "OPTIONS")
            .allowedHeaders("Content-Type", "Idempotency-Key")
            .allowCredentials(false).maxAge(3600);
    }
}
