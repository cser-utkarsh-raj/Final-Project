package com.stationery.auth.repository;

import com.stationery.auth.model.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email); //finds user by email in the database
    boolean existsByEmail(String email); // checks if a user with the given email exists in the database
}
