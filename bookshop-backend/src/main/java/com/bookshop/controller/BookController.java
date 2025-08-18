package com.bookshop.controller;

import com.bookshop.model.Book;
import com.bookshop.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

// this controller handles book-related operations such as retrieving books, searching, and getting statistics.

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/books")
public class BookController {

    @Autowired
    private BookRepository bookRepository;

    // Retrieves all books sorted by creation date in descending order
    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks() {
        List<Book> books = bookRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(books);
    }

    // Retrieves a book by its ID
    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable String id) {
        Optional<Book> book = bookRepository.findById(id);
        return book.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }

    // Searches for books based on a search term
    @GetMapping("/search")
    public ResponseEntity<List<Book>> searchBooks(@RequestParam String q) {
        List<Book> books = bookRepository.findBySearchTerm(q);
        return ResponseEntity.ok(books);
    }

    // Retrieves books by category
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Book>> getBooksByCategory(@PathVariable String category) {
        List<Book> books = bookRepository.findByCategory(category);
        return ResponseEntity.ok(books);
    }

    // Retrieves the top-selling books, limited to 10
    @GetMapping("/top-selling")
    public ResponseEntity<List<Book>> getTopSellingBooks() {
        List<Book> books = bookRepository.findTopSellingBooks();
        return ResponseEntity.ok(books.subList(0, Math.min(10, books.size())));
    }

    // Retrieves books that are currently available (stock > 0)
    @GetMapping("/available")
    public ResponseEntity<List<Book>> getAvailableBooks() {
        List<Book> books = bookRepository.findByStockGreaterThan(0);
        return ResponseEntity.ok(books);
    }

    // Retrieves statistics about books, including total count, category count, and distinct categories
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getBookStats() {
        long totalBooks = bookRepository.count();
        List<String> categories = bookRepository.findDistinctCategories();
        long categoryCount = categories.size();
        
        Map<String, Object> response = new HashMap<>();
        response.put("totalBooks", totalBooks);
        response.put("categoryCount", categoryCount);
        response.put("categories", categories);
        
        return ResponseEntity.ok(response);
    }
}
