package com.CollabSpace.authService.controller;

import com.CollabSpace.authService.service.JaaSTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/jaas")
public class JaaSTokenController {

    @Autowired
    private JaaSTokenService jaaSTokenService;

    @Value("${jaas.app.id}")
    private String appId;

    @PostMapping("/token")
    public ResponseEntity<Map<String, String>> getToken(@RequestBody Map<String, Object> body) {
        String userEmail = (String) body.get("email");
        String userName = (String) body.get("name");
        Boolean isModerator = (Boolean) body.getOrDefault("moderator", false);

        if (userEmail == null || userName == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "email and name are required"));
        }

        String token = jaaSTokenService.generateToken(userEmail, userName, isModerator);

        return ResponseEntity.ok(Map.of(
                "token", token,
                "appId", appId
        ));
    }
}