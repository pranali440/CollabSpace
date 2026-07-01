package com.CollabSpace.authService.config;

import com.CollabSpace.authService.security.JwtHelper;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtHelper jwtHelper;

    public JwtHandshakeInterceptor(JwtHelper jwtHelper) {
        this.jwtHelper = jwtHelper;
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {

        String query = request.getURI().getQuery(); // gets "token=xxx"
        if (query != null && query.contains("token=")) {
            String token = query.split("token=")[1].split("&")[0].trim();
            try {
                // ✅ using your exact method name
                String username = jwtHelper.getUsernameFromToken(token);
                Boolean expired = jwtHelper.isTokenExpired(token);

                if (username != null && !expired) {
                    attributes.put("username", username); // store in session
                    return true; // ✅ allow WebSocket connection
                }
            } catch (Exception e) {
                System.out.println("WebSocket JWT validation failed: " + e.getMessage());
                return false; // ❌ reject
            }
        }
        return false; // ❌ no token found
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                WebSocketHandler wsHandler, Exception ex) {
        // nothing needed
    }
}