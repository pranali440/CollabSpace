
package com.CollabSpace.authService.config;

import com.CollabSpace.authService.entities.Role;
import com.CollabSpace.authService.entities.User;
import com.CollabSpace.authService.enums.AppRole;
import com.CollabSpace.authService.enums.Providers;
import com.CollabSpace.authService.repositories.RoleRepository;
import com.CollabSpace.authService.security.JwtHelper;
import com.CollabSpace.authService.service.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SavedRequestAwareAuthenticationSuccessHandler {

    private final UserService userService;
    private final JwtHelper helper;
    private final RoleRepository roleRepository;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws ServletException, IOException {

        OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
        DefaultOAuth2User principal = (DefaultOAuth2User) authentication.getPrincipal();

        Map<String, Object> attributes = principal.getAttributes();
        String client = token.getAuthorizedClientRegistrationId();

        String email;
        String username;

        // 🔹 Handle Google vs GitHub
        if ("github".equals(client)) {
            username = attributes.getOrDefault("login", "").toString();
            email = attributes.get("email") != null
                    ? attributes.get("email").toString()
                    : username + "@github.com"; // fallback
        } else { // Google
            email = attributes.getOrDefault("email", "").toString();
            username = email.split("@")[0];
        }

        System.out.println("OAuth Login: " + email + " | " + username);

        // 🔹 Check if user exists
        User user = userService.findByEmail(email).orElseGet(() -> {
            User newUser = new User();

            Role role = roleRepository.findByRoleName(AppRole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Default role not found"));

            newUser.setRoles(Collections.singletonList(role));
            newUser.setEmail(email);
            newUser.setUserName(username);
            newUser.setSignUpMethod(
                    "github".equals(client) ? Providers.GITHUB : Providers.GOOGLE
            );

            return userService.registerUser(newUser);
        });

        // 🔹 Set authorities
        List<SimpleGrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getRoleName().name()))
                .collect(Collectors.toList());

        DefaultOAuth2User oauthUser = new DefaultOAuth2User(
                authorities,
                attributes,
                "github".equals(client) ? "id" : "sub"
        );

        Authentication securityAuth = new OAuth2AuthenticationToken(
                oauthUser,
                authorities,
                client
        );

        SecurityContextHolder.getContext().setAuthentication(securityAuth);

        // 🔹 Generate JWT
        String jwtToken = helper.generateToken(user);

        // 🔹 Redirect to frontend with token
        String targetUrl = UriComponentsBuilder
                .fromUriString(frontendUrl + "/oauth2/redirect")
                .queryParam("token", jwtToken)
                .build()
                .toUriString();

        setAlwaysUseDefaultTargetUrl(true);
        setDefaultTargetUrl(targetUrl);

        super.onAuthenticationSuccess(request, response, authentication);
    }
}

