package com.CollabSpace.authService.entities;

import com.CollabSpace.authService.enums.AppRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class Role {

    @Id
    private String roleId;

    @Enumerated(EnumType.STRING)   // ← ADD THIS
    @Column(nullable = false)
    private AppRole roleName;

    @ManyToMany(mappedBy = "roles", fetch = FetchType.LAZY)
    private List<User> users = new ArrayList<>();
 // ✅ ADD THIS MANUALLY
    public AppRole getRoleName() {
        return roleName;
    }

    // ✅ ADD THIS TOO
    public String getRoleId() {
        return roleId;
    }
}