package com.CollabSpace.authService.security;

import com.CollabSpace.authService.config.AppConstants;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
public class JWTAuthenticationFilter extends OncePerRequestFilter {


    @Autowired
    private JwtHelper jwtHelper;

    private Logger logger = LoggerFactory.getLogger(JWTAuthenticationFilter.class);


    private final UserDetailsService userDetailsService;

    public JWTAuthenticationFilter(UserDetailsService userDetailsService){
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        
    	String header = request.getHeader(AppConstants.JWT_HEADER_NAME);
    	logger.info("Request URI: {}", request.getRequestURI());
    	logger.info("Authorization header: {}", header);
    	String username = null;
    	String token = null;

    	// 1. Extract Token — check header first, then query param (for WebSocket)
    	if (header != null && header.startsWith("Bearer ")) {
    	    token = header.substring(7).trim();
    	    logger.info("Token extracted from header");
    	} else {
    	    // WebSocket connections pass token as ?token= query param
    	    String queryToken = request.getParameter("token");
    	    if (queryToken != null && !queryToken.isEmpty()) {
    	        token = queryToken;
    	        logger.info("Token extracted from query param");
    	    } else {
    	        logger.info("Invalid Header: No Bearer string found");
    	    }
    	}

    	if (token != null) {
    	    try {
    	        username = jwtHelper.getUsernameFromToken(token);
    	        logger.info("Extracted username: {}", username);
    	    } catch (Exception e) {
    	        logger.error("JWT Token error: {}", e.getMessage());
    	    }
    	}

        // 2. Validate and Set Authentication
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
            logger.info("UserDetails loaded: {}", userDetails.getUsername()); // ✅ add
            logger.info("Token valid: {}", jwtHelper.validateToken(token, userDetails)); // ✅ add
            
            // Simple check: is token valid?
            if (jwtHelper.validateToken(token, userDetails)) { // Create a simple validateToken method in helper
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // This is the line that actually "logs you in" for this request
                SecurityContextHolder.getContext().setAuthentication(authentication);
                logger.info("Authentication successful for user: {}", username);
            } else {
                logger.info("Token validation failed!");
            }
        }

        // 3. ALWAYS continue the chain
        filterChain.doFilter(request, response);
    }


        

}