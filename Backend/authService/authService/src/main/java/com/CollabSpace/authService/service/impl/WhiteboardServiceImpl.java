package com.CollabSpace.authService.service.impl;

import com.CollabSpace.authService.dtos.WhiteboardListResponse;
import com.CollabSpace.authService.dtos.WhiteboardRequest;
import com.CollabSpace.authService.dtos.WhiteboardResponse;
import com.CollabSpace.authService.entities.Whiteboard;
import com.CollabSpace.authService.repositories.WhiteboardRepository;
import com.CollabSpace.authService.service.WhiteboardService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class WhiteboardServiceImpl implements WhiteboardService {

    @Autowired
    private WhiteboardRepository whiteboardRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public WhiteboardListResponse listWhiteboards(String workspaceId) {
        List<String> boards = whiteboardRepository.findByWorkspaceId(workspaceId)
                .stream()
                .map(Whiteboard::getBoardName)
                .collect(Collectors.toList());
        return WhiteboardListResponse.builder().boards(boards).build();
    }

    @Override
    public WhiteboardResponse getWhiteboard(String workspaceId, String boardName) {
        return whiteboardRepository
                .findByWorkspaceIdAndBoardName(workspaceId, boardName)
                .map(wb -> {
                    try {
                        List<Object> elements = objectMapper.readValue(
                            wb.getElementsJson(),
                            objectMapper.getTypeFactory()
                                .constructCollectionType(List.class, Object.class)
                        );
                        return WhiteboardResponse.builder()
                                .board(Map.of("elements", elements))
                                .build();
                    } catch (Exception e) {
                        return WhiteboardResponse.builder()
                                .board(Map.of("elements", List.of()))
                                .build();
                    }
                })
                .orElse(WhiteboardResponse.builder()
                        .board(Map.of("elements", List.of()))
                        .build());
    }

    @Override
    public WhiteboardResponse saveWhiteboard(WhiteboardRequest request) {
        try {
            Whiteboard whiteboard = whiteboardRepository
                    .findByWorkspaceIdAndBoardName(
                        request.getWorkspaceId(),
                        request.getBoardName()
                    )
                    .orElse(new Whiteboard());

            whiteboard.setWorkspaceId(request.getWorkspaceId());
            whiteboard.setBoardName(request.getBoardName());
            whiteboard.setElementsJson(
                objectMapper.writeValueAsString(request.getElements())
            );

            whiteboardRepository.save(whiteboard);

            return WhiteboardResponse.builder()
                    .board(Map.of("elements", request.getElements()))
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Failed to save whiteboard: " + e.getMessage());
        }
    }

    @Override
    public void deleteWhiteboard(String workspaceId, String boardName) {
        whiteboardRepository.deleteByWorkspaceIdAndBoardName(workspaceId, boardName);
    }
}