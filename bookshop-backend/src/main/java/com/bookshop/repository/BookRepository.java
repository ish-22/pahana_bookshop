package com.bookshop.repository;

import com.bookshop.model.Book;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

// This interface extends MongoRepository to provide CRUD operations for Book entities.
@Repository
public interface BookRepository extends MongoRepository<Book, String> {
    List<Book> findByCategory(String category);
    List<Book> findByTitleContainingIgnoreCase(String title);
    List<Book> findByAuthorContainingIgnoreCase(String author);

    // Custom query to search for books by title, author, or category using a regex pattern.
    @Query("{'$or': [{'title': {'$regex': ?0, '$options': 'i'}}, {'author': {'$regex': ?0, '$options': 'i'}}, {'category': {'$regex': ?0, '$options': 'i'}}]}")
    List<Book> findBySearchTerm(String searchTerm);
    
    List<Book> findByStockGreaterThan(Integer stock);

    // Custom query to find the top-selling books, sorted by totalSold in descending order.
    @Query(value = "{}", sort = "{'totalSold': -1}")
    List<Book> findTopSellingBooks();

    // Custom query to find distinct categories of books.
    @Query(value = "{}", fields = "{'category': 1}")
    List<Book> findDistinctCategoriesRaw();

    // This method processes the raw results to return a distinct list of categories.
    default List<String> findDistinctCategories() {
        return findDistinctCategoriesRaw().stream()
            .map(Book::getCategory)
            .distinct()
            .toList();
    }
}
