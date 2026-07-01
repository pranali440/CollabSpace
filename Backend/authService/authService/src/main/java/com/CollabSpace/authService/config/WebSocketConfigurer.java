package com.CollabSpace.authService.config;

import com.CollabSpace.authService.security.JwtHelper;
import com.CollabSpace.authService.websockets.WorkspaceWebSocketHandler;
import com.CollabSpace.authService.websockets.TeamWebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfigurer implements org.springframework.web.socket.config.annotation.WebSocketConfigurer {

    @Autowired
    private WorkspaceWebSocketHandler workspaceWebSocketHandler;

    @Autowired
    private TeamWebSocketHandler teamWebSocketHandler;

    @Autowired
    private JwtHelper jwtHelper;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(workspaceWebSocketHandler, "/ws/workspace/**")
                .setAllowedOrigins("*")
                .addInterceptors(new JwtHandshakeInterceptor(jwtHelper));

        registry.addHandler(teamWebSocketHandler, "/ws/team/**")
                .setAllowedOrigins("*")
                .addInterceptors(new JwtHandshakeInterceptor(jwtHelper));
    }
}