package com.CollabSpace.authService.service.impl;





import com.CollabSpace.authService.entities.Idea;
import com.CollabSpace.authService.repositories.IdeaRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class IdeaService {

    private final IdeaRepository ideaRepository;
    private final ObjectMapper objectMapper;
    private final Map<String, List<WebSocketSession>> workspaceSessions;

    @Autowired
    public IdeaService(IdeaRepository ideaRepository, ObjectMapper objectMapper) {
        this.ideaRepository = ideaRepository;
        this.objectMapper = objectMapper;
        this.workspaceSessions = new ConcurrentHashMap<>();
    }
    @Transactional
    public Idea createIdea(Idea idea) {
        idea.setCreatedAt(LocalDateTime.now());
        Idea savedIdea = ideaRepository.save(idea);
        broadcastIdeaUpdate(savedIdea.getWorkspaceId(), "IDEA_CREATED", savedIdea);
        return savedIdea;
    }
    @Transactional  // ← ADD THIS
    public List<Idea> getIdeasByWorkspace(String workspaceId) {
        return ideaRepository.findByWorkspaceId(workspaceId);
    }
    @Transactional
    public Idea voteIdea(Long ideaId, String userId) {
        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new IllegalArgumentException("Idea not found"));

        if (idea.getVoters().contains(userId)) {
            // Already voted → remove vote (toggle off)
            idea.getVoters().remove(userId);
            idea.setVotes(Math.max(0, idea.getVotes() - 1));
        } else {
            // Not voted → add vote (toggle on)
            idea.getVoters().add(userId);
            idea.setVotes(idea.getVotes() + 1);
        }

        Idea updatedIdea = ideaRepository.save(idea);
        broadcastIdeaUpdate(idea.getWorkspaceId(), "IDEA_UPDATED", updatedIdea);
        return updatedIdea;
    }
    @Transactional
    public void deleteIdea(Long ideaId, String workspaceId) {
        Optional<Idea> optionalIdea = ideaRepository.findById(ideaId);
        if (optionalIdea.isPresent()) {
            ideaRepository.deleteById(ideaId);
            broadcastIdeaUpdate(workspaceId, "IDEA_DELETED", Map.of("id", ideaId));
        } else {
            throw new IllegalArgumentException("Idea not found");
        }
    }

    // Register WebSocket session for a workspace
    public void registerSession(String workspaceId, WebSocketSession session) {
        workspaceSessions.computeIfAbsent(workspaceId, k -> new java.util.ArrayList<>()).add(session);
    }

    // Remove WebSocket session
    public void removeSession(String workspaceId, WebSocketSession session) {
        List<WebSocketSession> sessions = workspaceSessions.get(workspaceId);
        if (sessions != null) {
            sessions.remove(session);
            if (sessions.isEmpty()) {
                workspaceSessions.remove(workspaceId);
            }
        }
    }

    private void broadcastIdeaUpdate(String workspaceId, String type, Object data) {
        List<WebSocketSession> sessions = workspaceSessions.get(workspaceId);
        if (sessions != null) {
            try {
                String message = objectMapper.writeValueAsString(Map.of(
                        "type", type,
                        "data", data,
                        "workspaceId", workspaceId
                ));
                for (WebSocketSession session : sessions) {
                    if (session.isOpen()) {
                        session.sendMessage(new TextMessage(message));
                    }
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}