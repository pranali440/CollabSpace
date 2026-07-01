package com.CollabSpace.authService.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "whiteboards")
@Data
public class Whiteboard {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String workspaceId;
    private String boardName;

    @Column(columnDefinition = "TEXT")
    private String elementsJson;
}