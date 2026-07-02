package com.CollabSpace.authService.service.impl;

import com.CollabSpace.authService.dtos.UserDto;
import com.CollabSpace.authService.dtos.WorkspaceDto;
import com.CollabSpace.authService.entities.Workspace;
import com.CollabSpace.authService.repositories.WorkspaceRepository;
import com.CollabSpace.authService.service.UserService;
import com.CollabSpace.authService.service.WorkSpaceService;
import com.CollabSpace.authService.utils.EmailService;
import jakarta.mail.MessagingException;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;
@Service
public class WorkspaceServiceImpl implements WorkSpaceService {
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");

    private static final Logger logger = LoggerFactory.getLogger(WorkspaceServiceImpl.class);
    @Autowired
    private ModelMapper mapper;

    @Autowired
    UserService userService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Override
    @Transactional // Keeps DB operations safe
    public WorkspaceDto createWorkspace(WorkspaceDto workspaceDto) {
    	
    	boolean exists = workspaceRepository.existsByWorkspaceNameAndOwnerAndType(
    		    workspaceDto.getWorkspaceName(),
    		    workspaceDto.getOwner(),
    		    workspaceDto.getType()
    		);
    		if (exists) {
    		    throw new IllegalArgumentException(
    		        "A " + workspaceDto.getType() + " workspace with name '" + 
    		        workspaceDto.getWorkspaceName() + "' already exists."
    		    );
    		}
        workspaceDto.setWorkspaceId(UUID.randomUUID().toString());
        workspaceDto.setCreatedDate(LocalDate.now());
        workspaceDto.setCreatedTime(LocalTime.now());

        // 1. Validate participant emails
        if (workspaceDto.getParticipants() != null) {
            for (String participant : workspaceDto.getParticipants()) {
                if (!EMAIL_PATTERN.matcher(participant).matches()) {
                    throw new IllegalArgumentException("Invalid email for participant: " + participant);
                }
            }
        }

        // 2. Map and Setup Permissions
        Workspace workspace = mapper.map(workspaceDto, Workspace.class);
        Map<String, String> permissions = new HashMap<>();
        permissions.put(workspace.getOwner(), "edit");

        if (!workspace.getType().equalsIgnoreCase("individual")) {
            if (workspace.getParticipants() != null) {
                for (String participant : workspace.getParticipants()) {
                    permissions.put(participant, "view");
                }
            }
        }
        workspace.setPermissions(permissions);

        // 3. Save to Database (This happens first)
        Workspace savedWorkspace = workspaceRepository.save(workspace);

        // 4. Send Emails in the BACKGROUND (Asynchronous)
        if (workspace.getType().equalsIgnoreCase("Group") || workspace.getType().equalsIgnoreCase("Team")) {
            // We create a copy of the data needed for the thread to avoid concurrency issues
            List<String> recipients = new ArrayList<>(workspaceDto.getParticipants());
            Map<String, Object> emailVariables = Map.of(
                    "workspaceName", savedWorkspace.getWorkspaceName(),
                    "workspaceDescription", savedWorkspace.getWorkspaceDescription() != null ? savedWorkspace.getWorkspaceDescription() : "",
                    "owner", savedWorkspace.getOwner()
            );

            // This creates a separate thread so the user doesn't have to wait
            new Thread(() -> {
                for (String participant : recipients) {
                    try {
                        emailService.sendEmail(
                                participant,
                                "You've been added to a new workspace: " + savedWorkspace.getWorkspaceName(),
                                "workspace-email",
                                emailVariables
                        );
                        logger.info("Background email sent to: {}", participant);
                    } catch (Exception e) {
                        // We LOG the error instead of throwing it, so the Workspace creation isn't rolled back
                        logger.error("Failed to send background email to {}: {}", participant, e.getMessage());
                    }
                }
            }).start();
        }

        // 5. Return immediately to the UI
        return mapper.map(savedWorkspace, WorkspaceDto.class);
    }

    @Override
    @Transactional
    public WorkspaceDto deleteWorkspace(String workspaceName, String workspaceId) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found with ID: " + workspaceId));

        // Only validate name if it was actually provided
        if (workspaceName != null && !workspace.getWorkspaceName().equals(workspaceName)) {
            throw new RuntimeException("Workspace name does not match the provided ID.");
        }

        workspaceRepository.delete(workspace);

        // Send emails in background — don't block or rollback on failure
        if (workspace.getParticipants() != null && !workspace.getParticipants().isEmpty()) {
            Map<String, Object> emailVariables = Map.of(
                    "workspaceName", workspace.getWorkspaceName(),
                    "owner", workspace.getOwner()
            );
            new Thread(() -> {
                for (String participant : workspace.getParticipants()) {
                    try {
                        emailService.sendEmail(
                                participant,
                                "Workspace " + workspace.getWorkspaceName() + " has been deleted",
                                "workspace-deleted",
                                emailVariables
                        );
                    } catch (Exception e) {
                        logger.error("Failed to send deletion email to {}: {}", participant, e.getMessage());
                    }
                }
            }).start();
        }

        return mapToDto(workspace);
    }
    @Override
    @Transactional(readOnly = true) // <--- Add this
    public List<WorkspaceDto> getAllWorkspace() {
        return workspaceRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true) // <--- Add this
    public WorkspaceDto getWorkspace(String workspaceId) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found with ID: " + workspaceId));
        return mapToDto(workspace);
    }

    @Override
    public void joinWorkspace(String workspaceId, String username) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
        if (!EMAIL_PATTERN.matcher(username).matches()) {
            throw new IllegalArgumentException("Invalid email: " + username);
        }
        if (workspace.getType().equals("Individual")) {
            throw new IllegalStateException("Cannot join individual workspace");
        }
        if (!workspace.getParticipants().contains(username)) {
            workspace.getParticipants().add(username);
            workspaceRepository.save(workspace);
        }
    }

    @Override
    @Transactional(readOnly = true) // <--- Add this
    public List<WorkspaceDto> getAllByOwner(String userId) {
        return workspaceRepository.findByOwner(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true) // <--- Add this
    public List<WorkspaceDto> getAllByUser(String userId) {
        List<Workspace> workspaces = workspaceRepository.findByParticipantsContainingAndNotOwner(userId);
        System.out.println("Joined workspaces for userId " + userId + ": " + workspaces);
        return workspaces.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true) // <--- Add this
    public Map<String, Object> updatePermissions(String workspaceId, Map<String, String> permissions) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found with ID: " + workspaceId));

        String currentUserId = getCurrentUserId();
        UserDto user = userService.getUserByUsername(currentUserId);
        if (!workspace.getOwner().equals(user.getUserId())) {
            throw new RuntimeException("Only the workspace owner can update permissions");
        }

        Map<String, String> validPermissions = new HashMap<>();
        List<String> skippedUsers = new ArrayList<>();
        for (Map.Entry<String, String> entry : permissions.entrySet()) {
            String userId = entry.getKey();
            String permission = entry.getValue();

            // Validate permission value
            if (!permission.equals("view") && !permission.equals("edit")) {
                logger.warn("Invalid permission value for user {}: {}. Must be 'view' or 'edit'. Skipping.", userId, permission);
                skippedUsers.add(userId);
                continue;
            }
         // Block edit permission for team workspace members
            if (workspace.getType().equalsIgnoreCase("team") && permission.equals("edit") && !userId.equals(workspace.getOwner())) {
                logger.warn("Cannot give edit permission to members in team workspace. Skipping user: {}", userId);
                skippedUsers.add(userId);
                continue;
            }

            // Check if user is a participant or owner
            if (userId.equals(workspace.getOwner()) || (workspace.getParticipants() != null && workspace.getParticipants().contains(userId))) {
                validPermissions.put(userId, permission);
            } else {
                logger.warn("User {} is not a participant of workspace {}. Skipping permission update.", userId, workspaceId);
                skippedUsers.add(userId);
            }
        }

        // Ensure owner's permission is always edit
        validPermissions.put(workspace.getOwner(), "edit");

        // Update permissions
        workspace.setPermissions(validPermissions);
        Workspace updatedWorkspace = workspaceRepository.save(workspace);

        logger.info("Permissions updated for workspace {}: {}", workspaceId, validPermissions);

        // Return response with updated permissions and skipped users
        Map<String, Object> response = new HashMap<>();
        response.put("permissions", validPermissions);
        response.put("skippedUsers", skippedUsers);
        return response;

/*
        Map<String, Object> emailVariables = Map.of(
                "workspaceName", workspace.getWorkspaceName(),
                "owner", workspace.getOwner()
        );

        for (String participant : workspace.getParticipants()) {
            try {
                emailService.sendEmail(
                        participant,
                        "Permissions updated for workspace: " + workspace.getWorkspaceName(),
                        "permissions-updated",
                        emailVariables
                );
            } catch (MessagingException e) {
                throw new RuntimeException("Failed to send permission update email to " + participant + ": " + e.getMessage());
            }
        }*/
    }

    private WorkspaceDto mapToDto(Workspace workspace) {
        return mapper.map(workspace, WorkspaceDto.class);
    }

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}