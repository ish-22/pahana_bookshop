package com.bookshop.controller;

import com.bookshop.model.Book;
import com.bookshop.model.Order;
import com.bookshop.model.User;
import com.bookshop.repository.BookRepository;
import com.bookshop.repository.OrderRepository;
import com.bookshop.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// This controller handles administrative tasks such as managing books, users, and orders.

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // Basic counts
        long totalBooks = bookRepository.count();
        long totalUsers = userRepository.count();
        long totalOrders = orderRepository.count();

        // Calculate total revenue
        List<Order> orders = orderRepository.findAll();
        BigDecimal totalRevenue = orders.stream()
                .map(Order::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Recent orders
        List<Order> recentOrders = orderRepository.findAllOrderByCreatedAtDesc()
                .stream()
                .limit(5)
                .toList();

        // Top selling books
        List<Book> topBooks = bookRepository.findTopSellingBooks()
                .stream()
                .limit(5)
                .toList();

        // Recent users
        List<User> recentUsers = userRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .limit(5)
                .toList();

        stats.put("totalBooks", totalBooks);
        stats.put("totalUsers", totalUsers);
        stats.put("totalOrders", totalOrders);
        stats.put("totalRevenue", totalRevenue);
        stats.put("recentOrders", recentOrders);
        stats.put("topBooks", topBooks);
        stats.put("recentUsers", recentUsers);

        return ResponseEntity.ok(stats);
    }

    // Book Management
    // The endpoint retrieves all books for admin management.
    @GetMapping("/books")
    public ResponseEntity<List<Book>> getAllBooksAdmin() {
        List<Book> books = bookRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(books);
    }

    // The endpoint creates a new book.
    @PostMapping("/books")
    public ResponseEntity<Book> createBook(@RequestBody Book book) {
        Book savedBook = bookRepository.save(book);
        return ResponseEntity.ok(savedBook);
    }

    // The endpoint retrieves a book by its ID.
    @PutMapping("/books/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable String id, @RequestBody Book book) {
        if (!bookRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        book.setId(id);
        Book updatedBook = bookRepository.save(book);
        return ResponseEntity.ok(updatedBook);
    }

    // The endpoint deletes a book by its ID.
    @DeleteMapping("/books/{id}")
    public ResponseEntity<?> deleteBook(@PathVariable String id) {
        if (!bookRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        bookRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // User Management
    // The endpoint retrieves all users for admin management.
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(users);
    }

    // The endpoint retrieves a user by its ID.
    @PutMapping("/users/{id}/status")
    public ResponseEntity<User> updateUserStatus(@PathVariable String id, @RequestBody Map<String, String> request) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setStatus(request.get("status"));
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // The endpoint deletes a user by its ID.
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // Order Management
    // The endpoint retrieves all orders for admin management.
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderRepository.findAllOrderByCreatedAtDesc();
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable String id, @RequestBody Map<String, String> request) {
        return orderRepository.findById(id)
                .map(order -> {
                    order.setStatus(request.get("status"));
                    return ResponseEntity.ok(orderRepository.save(order));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // The endpoint deletes an order by its ID.
    @DeleteMapping("/orders/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable String id) {
        if (!orderRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        orderRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
