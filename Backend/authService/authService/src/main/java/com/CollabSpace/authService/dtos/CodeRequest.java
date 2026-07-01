package com.CollabSpace.authService.dtos;


import lombok.Data;

@Data
public class CodeRequest {
    private String prompt;
    private String language;
    private String mode; // ✅ "execute" or "generate"
    private String code; // ✅ actual code to execute
}