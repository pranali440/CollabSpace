package com.CollabSpace.authService.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class JaaSTokenService {

    @Value("${jaas.app.id}")
    private String appId;

    @Value("${jaas.api.key.id}")
    private String apiKeyId;

    @Value("${jaas.private.key.path}")
    private Resource privateKeyResource;

    private PrivateKey privateKey;

    @PostConstruct
    public void init() throws Exception {
        // Read the PEM file from resources
        String pem = new String(privateKeyResource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);

        // Strip PEM headers and whitespace
        String privateKeyPEM = pem
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s+", "");

        byte[] keyBytes = Base64.getDecoder().decode(privateKeyPEM);
        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        this.privateKey = kf.generatePrivate(spec);
    }

    public String generateToken(String userEmail, String userName, boolean isModerator) {
        long now = System.currentTimeMillis();
        long expiry = now + (3600 * 1000); // 1 hour

        Map<String, Object> userContext = new HashMap<>();
        userContext.put("user", Map.of(
                "name", userName,
                "email", userEmail,
                "moderator", isModerator
        ));
        userContext.put("features", Map.of(
                "recording", false,
                "livestreaming", false,
                "transcription", false,
                "outbound-call", false
        ));

        return Jwts.builder()
                .setHeaderParam("kid", apiKeyId)
                .setHeaderParam("typ", "JWT")
                .setIssuer("chat")
                .setSubject(appId)
                .setAudience("jitsi")
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(expiry))
                .setId(UUID.randomUUID().toString())
                .claim("room", "*")
                .claim("context", userContext)
                .signWith(privateKey, SignatureAlgorithm.RS256)
                .compact();
    }
}