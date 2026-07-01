package com.CollabSpace.authService.repositories;

import com.CollabSpace.authService.entities.Whiteboard;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WhiteboardRepository extends JpaRepository<Whiteboard, String> {
    Optional<Whiteboard> findByWorkspaceIdAndBoardName(String workspaceId, String boardName);
    List<Whiteboard> findByWorkspaceId(String workspaceId);
    void deleteByWorkspaceIdAndBoardName(String workspaceId, String boardName);
}