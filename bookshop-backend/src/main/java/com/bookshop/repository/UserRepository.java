package com.bookshop.repository;

import com.bookshop.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;


@Repository
public interface UserRepository extends MongoRepository<User, String> {
    // Find a user by their email address
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    List<User> findByStatus(String status);
    List<User> findByNameContainingIgnoreCase(String name);
}
