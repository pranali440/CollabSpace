package com.CollabSpace.authService.config;



import com.CollabSpace.authService.security.JWTAuthenticationFilter;
import com.CollabSpace.authService.security.JwtAuthenticationEntryPoint;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity(debug = true)
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

	    @Autowired
	    private JWTAuthenticationFilter filter;

	    @Autowired
	    private JwtAuthenticationEntryPoint entryPoint;

	    @Autowired
	    @Lazy
	    private OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

	    @Bean
	    public SecurityFilterChain securityFilterChain(HttpSecurity security) throws Exception {

	        security
	            // 🔥 CORS
	        .cors(cors -> cors.configurationSource(request -> {
	            CorsConfiguration config = new CorsConfiguration();
	            config.setAllowedOrigins(List.of(
	            	    "http://localhost:3000",
	            	    "http://localhost:5173",
	            	    "https://collab-space-ashy.vercel.app"
	            	));
	            config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
	            config.setAllowedHeaders(List.of("*"));
	            config.setAllowCredentials(true);
	            config.setMaxAge(3600L);
	            return config;
	        }))

	            // 🔥 CSRF disable
	            .csrf(AbstractHttpConfigurer::disable)

	            // 🔥 AUTH RULES (ONLY ONE BLOCK)
	            .authorizeHttpRequests(request -> request

	            	    // ✅ Public endpoints
	            	    .requestMatchers(
	            	        "/api/auth/public/**",
	            	        "/oauth2/**",
	            	        "/api/contact"
	            	        
	            	    ).permitAll()
	            	 // ✅ ADD THIS - permit error endpoint separately
	            	    .requestMatchers("/error").permitAll()

	            	    // ✅ ADD THIS - permit WebSocket handshake URLs
	            	    .requestMatchers("/ws/**").permitAll()

	            	    .requestMatchers(
	            	        HttpMethod.POST,
	            	        "/api/auth/public/forgot-password",
	            	        "/api/auth/public/reset-password"
	            	    ).permitAll()

	            	    // ... rest stays the same
	            	

	                // ✅ Workspace (protected)
	                .requestMatchers("/workspace/**").authenticated()
	                .requestMatchers("/api/workspace/**").authenticated()
	                .requestMatchers(HttpMethod.POST,
	                    "/workspace/{workspaceId}/permissions"
	                ).authenticated()
	                
	                
	                .requestMatchers("/code/**").authenticated()
	                .requestMatchers("/jaas/token").authenticated()
	                
	                // ✅ Content
	                .requestMatchers("/api/content/**").authenticated()

	                // ✅ Users
	                .requestMatchers("/users/all", "/users/user").permitAll()
	                .requestMatchers(HttpMethod.DELETE, "/users/**")
	                    .hasRole(AppConstants.ROLE_ADMIN)

	                // ✅ Everything else
	                .anyRequest().authenticated()
	            )

	            // 🔥 OAuth2 login
	            .oauth2Login(oauth2 -> oauth2
	                .successHandler(oAuth2LoginSuccessHandler)
	            )

	            // 🔥 Exception handling
	            .exceptionHandling(ex ->
	                ex.authenticationEntryPoint(entryPoint)
	            )

	            // 🔥 Stateless session (VERY IMPORTANT)
	            .sessionManagement(session ->
	                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
	            )

	            // 🔥 JWT filter
	            .addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class);

	        return security.build();
	    }

	    // 🔐 Password encoder
	    @Bean
	    public PasswordEncoder passwordEncoder() {
	        return new BCryptPasswordEncoder();
	    }

	    // 🔐 Authentication manager
	    @Bean
	    public AuthenticationManager authenticationManager(
	            AuthenticationConfiguration builder
	    ) throws Exception {
	        return builder.getAuthenticationManager();
	    }
	}
	