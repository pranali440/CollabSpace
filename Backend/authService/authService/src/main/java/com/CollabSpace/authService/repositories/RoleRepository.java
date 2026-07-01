
package com.CollabSpace.authService.repositories;

import com.CollabSpace.authService.entities.Role;
import com.CollabSpace.authService.enums.AppRole;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface RoleRepository extends JpaRepository<Role, String> {

    Optional<Role> findByRoleName(AppRole roleName);

    boolean existsByRoleName(AppRole roleName); // ✅ ADD ONLY THIS
}