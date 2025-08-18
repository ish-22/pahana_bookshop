package com.bookshop.security.jwt;

import com.bookshop.security.services.UserDetailsServiceImpl;
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
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class AuthTokenFilter extends OncePerRequestFilter {
    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    // This filter intercepts requests to check for JWT tokens in the Authorization header
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // Extract JWT token from the request header
            String jwt = parseJwt(request);
            logger.debug("JWT Token found: {}", jwt != null ? "Yes (length: " + jwt.length() + ")" : "No");
            
            if (jwt != null) {
                boolean isValid = jwtUtils.validateJwtToken(jwt);
                logger.debug("JWT Token validation result: {}", isValid);
                
                if (isValid) {
                    String email = jwtUtils.getEmailFromJwtToken(jwt);
                    logger.debug("Email extracted from JWT: {}", email);

                    // Load user details using the email from the JWT token
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    logger.debug("Authentication set for user: {}", email);
                } else {
                    logger.warn("JWT Token validation failed for request: {}", request.getRequestURI());
                }
            } else {
                logger.debug("No JWT token found in request: {}", request.getRequestURI());
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication for request {}: {}", request.getRequestURI(), e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    //Extracts the JWT token from the Authorization header
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }
}
