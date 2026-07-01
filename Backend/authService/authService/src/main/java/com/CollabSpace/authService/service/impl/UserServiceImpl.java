package com.CollabSpace.authService.service.impl;

import com.CollabSpace.authService.dtos.UserDto;
import com.CollabSpace.authService.entities.PasswordResetToken;
import com.CollabSpace.authService.entities.Role;
import com.CollabSpace.authService.entities.User;
import com.CollabSpace.authService.enums.AppRole;
import com.CollabSpace.authService.enums.Providers;
import com.CollabSpace.authService.exception.ResourceNotFoundException;
import com.CollabSpace.authService.repositories.PasswordResetTokenRepository;
import com.CollabSpace.authService.repositories.RoleRepository;
import com.CollabSpace.authService.repositories.UserRepository;
import com.CollabSpace.authService.service.UserService;
import com.CollabSpace.authService.utils.EmailService;

import jakarta.transaction.Transactional;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ModelMapper mapper;

  //  @Value("${user.profile.image.path}")
   // private String imagePath;

    private Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private EmailService emailService;

    @Value("${frontend.url}")
    String frontendUrl;


    @Override
    public UserDto createUser(UserDto userDto) {
        String userId = UUID.randomUUID().toString();
        userDto.setUserId(userId);

        User user = dtoToEntity(userDto);

        // ✅ Set everything on USER entity
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setAccountNonLocked(true);
        user.setAccountNonExpired(true);
        user.setCredentialsNonExpired(true);
        user.setEnabled(true);
        user.setCredentialsExpiryDate(LocalDate.now().plusYears(1));
        user.setAccountExpiryDate(LocalDate.now().plusYears(1));
       
        user.setSignUpMethod(Providers.SELF);

        // ✅ Role — create if doesn't exist in DB
        Role roleNormal = roleRepository.findByRoleName(AppRole.ROLE_USER)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setRoleId(UUID.randomUUID().toString());
                    newRole.setRoleName(AppRole.ROLE_USER);
                    return roleRepository.save(newRole);
                });

        user.setRoles(List.of(roleNormal));

        User savedUser = userRepository.save(user);
        return entityToDto(savedUser);
    }

    // ✅ FIXED: Only update password and profileImage when actually provided
    @Override
    public UserDto updateUser(UserDto userDto, String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with given id !!"));

        // Always update username
        if (userDto.getUserName() != null && !userDto.getUserName().isBlank()) {
            user.setUserName(userDto.getUserName());
        }

        // Only update password if a new one was actually sent
        if (userDto.getPassword() != null && !userDto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        }

        // Only update profile image if a new one was actually sent
        if (userDto.getProfileImage() != null && !userDto.getProfileImage().isBlank()) {
            user.setProfileImage(userDto.getProfileImage());
        }

        User updatedUser = userRepository.save(user);
        return entityToDto(updatedUser);
    }

    @Override
    public void deleteUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with given id !!"));
        userRepository.delete(user);
    }

    @Override
    public UserDto getUserByUsername(String username) {
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("User Not Found!"));
        return entityToDto(user);
    }

    @Override
    public List<UserDto> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserDto> userDtoList = users.stream().map(
                user -> mapper.map(user, UserDto.class)
        ).toList();
        return userDtoList;
    }

    @Override
    public User findUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private UserDto entityToDto(User savedUser) {
        return mapper.map(savedUser, UserDto.class);
    }

    private User dtoToEntity(UserDto userDto) {
        return mapper.map(userDto, User.class);
    }

    @Override
    public void generatePasswordResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found!"));
        String token = UUID.randomUUID().toString();
        Instant expiryDate = Instant.now().plus(15, ChronoUnit.MINUTES);
        PasswordResetToken resetToken = new PasswordResetToken(token, expiryDate, user);
        passwordResetTokenRepository.save(resetToken);
        System.out.println(frontendUrl);
        String reserUrl = frontendUrl + "/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(), reserUrl);
    }
    @Transactional  // ← ADD THIS ANNOTATION
    @Override
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid Password Reset Token"));

        if (resetToken.isUsed()) {
            throw new RuntimeException("Password Reset Token has already being used");
        }

        if (resetToken.getExpiryDate().isBefore(Instant.now())) {
            throw new RuntimeException("Password Reset Token has expired");
        }
        // ← CHANGE THIS: fetch user directly by ID instead of using lazy proxy
        User user = userRepository.findById(resetToken.getUser().getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }
    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public User registerUser(User user) {
        if (user.getPassword() != null)
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
}