package com.bookshop.repository;

import com.bookshop.model.Feedback;
import com.bookshop.model.User;
import com.bookshop.model.Book;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends MongoRepository<Feedback, String> {
    
    // Find all approved and visible feedbacks for home page display
    List<Feedback> findByIsApprovedTrueAndIsVisibleTrueOrderByCreatedAtDesc();
    
    // Find approved feedbacks with pagination for home page
    Page<Feedback> findByIsApprovedTrueAndIsVisibleTrueOrderByCreatedAtDesc(Pageable pageable);
    
    // Find feedbacks by user
    List<Feedback> findByUserAndIsVisibleTrueOrderByCreatedAtDesc(User user);
    
    // Find feedbacks by book
    List<Feedback> findByBookAndIsApprovedTrueAndIsVisibleTrueOrderByCreatedAtDesc(Book book);
    
    // Find feedbacks by type (book or service)
    List<Feedback> findByFeedbackTypeAndIsApprovedTrueAndIsVisibleTrueOrderByCreatedAtDesc(String feedbackType);
    
    // Admin: Find all feedbacks for management
    Page<Feedback> findByIsVisibleTrueOrderByCreatedAtDesc(Pageable pageable);
    
    // Admin: Find pending approval feedbacks
    List<Feedback> findByIsApprovedFalseAndIsVisibleTrueOrderByCreatedAtDesc();
    
    // Count approved feedbacks
    long countByIsApprovedTrueAndIsVisibleTrue();
    
    // Find recent feedbacks (last 10)
    @Query(value = "{isApproved: true, isVisible: true}", sort = "{createdAt: -1}")
    List<Feedback> findTop10ByIsApprovedTrueAndIsVisibleTrueOrderByCreatedAtDesc();
}
