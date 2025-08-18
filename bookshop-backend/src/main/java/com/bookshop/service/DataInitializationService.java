package com.bookshop.service;
import com.bookshop.model.Role;
import com.bookshop.model.User;
import com.bookshop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class DataInitializationService implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initializeUsers();
    }

    private void initializeUsers() {
        // Create admin user if not exists
        if (!userRepository.existsByEmail("admin@bookshop.com")) {
            User admin = new User("Admin User", "admin@bookshop.com", passwordEncoder.encode("admin123"));
            admin.setRoles(Set.of(Role.ROLE_ADMIN, Role.ROLE_USER));
            admin.setStatus("active");
            userRepository.save(admin);
            System.out.println("Admin user created: admin@bookshop.com / admin123");
        }
    }
}
