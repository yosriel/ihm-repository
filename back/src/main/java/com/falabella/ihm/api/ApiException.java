package com.falabella.ihm.api;

import org.springframework.http.HttpStatus;

public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String field;

    public ApiException(HttpStatus status, String message, String field) {
        super(message);
        this.status = status;
        this.field = field;
    }

    public static ApiException invalid(String message, String field) {
        return new ApiException(HttpStatus.BAD_REQUEST, message, field);
    }

    public HttpStatus status() {
        return status;
    }

    public String field() {
        return field;
    }
}
