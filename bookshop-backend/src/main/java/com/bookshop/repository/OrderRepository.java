package com.bookshop.repository;

import com.bookshop.model.Order;
import com.bookshop.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByUser(User user);
    List<Order> findByUserEmail(String email);
    List<Order> findByStatus(String status);

    // Custom query to find all orders, sorted by createdAt in descending order
    @Query(value = "{}", sort = "{'createdAt': -1}")
    List<Order> findAllOrderByCreatedAtDesc();

    List<Order> findByUserOrderByCreatedAtDesc(User user);
}
