package com.stationery.auth;

import com.stationery.auth.model.Role;
import com.stationery.auth.model.User;
import com.stationery.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@EnableDiscoveryClient
@SpringBootApplication
public class AuthServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }

    @Bean
    CommandLineRunner seedUsers(UserRepository users, PasswordEncoder encoder) {
        return args -> {
            if (users.findByEmail("admin@college.edu").isEmpty()) {
                users.save(new User("Admin User", "admin@college.edu", encoder.encode("Admin@123"), Role.ADMIN));
            }
            if (users.findByEmail("student@college.edu").isEmpty()) {
                users.save(new User("Student User", "student@college.edu", encoder.encode("Student@123"), Role.STUDENT));
            }
        };
    }
}
