package com.medconnect.backend.controller;

import com.medconnect.backend.entity.User;
import com.medconnect.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        if ("DOCTOR".equals(user.getRole().name()) || "PHARMACIST".equals(user.getRole().name())) {
             user.setIsApproved(false);
        } else {
             user.setIsApproved(true);
        }
        
        return userRepository.save(user);
    }

    @PostMapping("/login")
    public org.springframework.http.ResponseEntity<?> login(@RequestBody User loginRequest) {
        try {
            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                return org.springframework.http.ResponseEntity.status(401).body("Invalid credentials");
            }
            
            if (user.getIsApproved() != null && !user.getIsApproved()) {
                return org.springframework.http.ResponseEntity.status(403).body("Account pending administrative approval.");
            }

            return org.springframework.http.ResponseEntity.ok("mock-jwt-token-for-" + user.getEmail() + "-role-" + user.getRole());
        } catch(Exception e) {
            return org.springframework.http.ResponseEntity.status(401).body("Invalid credentials");
        }
    }
}
