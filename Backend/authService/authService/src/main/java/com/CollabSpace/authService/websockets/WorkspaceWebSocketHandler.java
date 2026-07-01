package com.CollabSpace.authService.websockets;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

@Component
public class WorkspaceWebSocketHandler extends TextWebSocketHandler {

    private static final Logger LOGGER = Logger.getLogger(WorkspaceWebSocketHandler.class.getName());
    private final Map<String, Map<String, WebSocketSession>> workspaceSessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // ✅ FIX — use getPath() to avoid ?token= being included in workspaceId
        String path = session.getUri().getPath();
        String[] parts = path.split("/");
        String workspaceId = parts[parts.length - 1];

        workspaceSessions.computeIfAbsent(workspaceId, k -> new ConcurrentHashMap<>())
                .put(session.getId(), session);
        LOGGER.info("WebSocket connected: workspace/" + workspaceId + 
                    ", session: " + session.getId() + 
                    ", total sessions: " + workspaceSessions.get(workspaceId).size());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        Map<String, Object> data = objectMapper.readValue(payload, Map.class);
        String messageType = (String) data.get("type");
        String workspaceId = (String) data.get("workspaceId");

        Map<String, WebSocketSession> sessions = workspaceSessions
                .getOrDefault(workspaceId, new ConcurrentHashMap<>());

        LOGGER.info("Broadcasting message type: " + messageType + 
                    " to workspace: " + workspaceId + 
                    ", sessions: " + sessions.size());

        switch (messageType) {
            case "CHAT_MESSAGE":
            case "TASK_CREATED":
            case "TASK_UPDATED":
            case "TASK_DELETED":
            case "NOTIFICATION":
            case "MEMBER_ADDED":
            case "MEMBER_REMOVED":
            case "CODE_UPDATE":
            case "NOTE_UPDATE":
            case "PERMISSION_UPDATE":
            case "IDEA_CREATED":
            case "IDEA_UPDATED":
            case "IDEA_DELETED":
            case "CONTENT_PUBLISHED":
            case "WHITEBOARD_UPDATE":
                // ✅ Broadcast to ALL sessions in workspace including sender
                // (sender's own frontend handles deduplication)
                for (WebSocketSession ws : sessions.values()) {
                    if (ws.isOpen()) {
                        try {
                            ws.sendMessage(new TextMessage(payload));
                        } catch (Exception e) {
                            LOGGER.warning("Failed to send to session: " + ws.getId());
                        }
                    }
                }
                break;
            default:
                LOGGER.warning("Unknown message type: " + messageType);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        // ✅ FIX — use getPath() to avoid ?token= being included
        String path = session.getUri().getPath();
        String[] parts = path.split("/");
        String workspaceId = parts[parts.length - 1];

        Map<String, WebSocketSession> sessions = workspaceSessions.get(workspaceId);
        if (sessions != null) {
            sessions.remove(session.getId());
            if (sessions.isEmpty()) {
                workspaceSessions.remove(workspaceId);
            }
        }
        LOGGER.info("WebSocket disconnected: workspace/" + workspaceId + 
                    ", session: " + session.getId() + ", status: " + status);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        LOGGER.severe("WebSocket transport error: " + exception.getMessage());
        if (session.isOpen()) {
            session.close(CloseStatus.SERVER_ERROR);
        }
    }

    // ✅ Helper method to broadcast from backend services
    public void broadcastToWorkspace(String workspaceId, String message) {
        Map<String, WebSocketSession> sessions = workspaceSessions
                .getOrDefault(workspaceId, new ConcurrentHashMap<>());
        for (WebSocketSession ws : sessions.values()) {
            if (ws.isOpen()) {
                try {
                    ws.sendMessage(new TextMessage(message));
                } catch (Exception e) {
                    LOGGER.warning("Failed to broadcast to session: " + ws.getId());
                }
            }
        }
    }
}