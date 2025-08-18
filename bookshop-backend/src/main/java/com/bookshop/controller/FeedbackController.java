package com.bookshop.controller;

import com.bookshop.model.Feedback;
import com.bookshop.model.User;
import com.bookshop.model.Book;
import com.bookshop.payload.request.FeedbackRequest;
import com.bookshop.payload.response.MessageResponse;
import com.bookshop.repository.FeedbackRepository;
import com.bookshop.repository.UserRepository;
import com.bookshop.repository.BookRepository;
import com.bookshop.security.services.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    // Public endpoint to get approved feedbacks for home page
    @GetMapping("/public")
    public ResponseEntity<List<Feedback>> getPublicFeedbacks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            if (size <= 0) {
                // Return latest 10 feedbacks without pagination
                List<Feedback> feedbacks = feedbackRepository.findTop10ByIsApprovedTrueAndIsVisibleTrueOrderByCreatedAtDesc();
                return ResponseEntity.ok(feedbacks);
            } else {
                // Return paginated results
                Pageable pageable = PageRequest.of(page, size);
                Page<Feedback> feedbackPage = feedbackRepository.findByIsApprovedTrueAndIsVisibleTrueOrderByCreatedAtDesc(pageable);
                return ResponseEntity.ok(feedbackPage.getContent());
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get feedbacks by type (book or service)
    @GetMapping("/public/type/{type}")
    public ResponseEntity<List<Feedback>> getFeedbacksByType(@PathVariable String type) {
        try {
            if (!type.equals("book") && !type.equals("service")) {
                return ResponseEntity.badRequest().build();
            }
            
            List<Feedback> feedbacks = feedbackRepository.findByFeedbackTypeAndIsApprovedTrueAndIsVisibleTrueOrderByCreatedAtDesc(type);
            return ResponseEntity.ok(feedbacks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get feedback statistics
    @GetMapping("/public/stats")
    public ResponseEntity<?> getFeedbackStats() {
        try {
            long totalFeedbacks = feedbackRepository.countByIsApprovedTrueAndIsVisibleTrue();
            return ResponseEntity.ok().body(new MessageResponse("Total approved feedbacks: " + totalFeedbacks));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Create new feedback (authenticated users only)
    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> createFeedback(@Valid @RequestBody FeedbackRequest feedbackRequest, 
                                          Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            Optional<User> userOpt = userRepository.findByEmail(userPrincipal.getEmail());
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("User not found"));
            }

            User user = userOpt.get();
            
            // Create feedback
            Feedback feedback = new Feedback();
            feedback.setUser(user);
            feedback.setCustomerName(feedbackRequest.getCustomerName());
            feedback.setComment(feedbackRequest.getComment());
            feedback.setRating(feedbackRequest.getRating());
            feedback.setFeedbackType(feedbackRequest.getFeedbackType());
            
            // If book-specific feedback, set the book reference
            if (feedbackRequest.getBookId() != null && !feedbackRequest.getBookId().isEmpty()) {
                Optional<Book> bookOpt = bookRepository.findById(feedbackRequest.getBookId());
                if (bookOpt.isPresent()) {
                    feedback.setBook(bookOpt.get());
                }
            }
            
            // For demo purposes, auto-approve feedback (in production, you might want admin approval)
            feedback.setApproved(true);
            
            feedbackRepository.save(feedback);
            
            return ResponseEntity.ok(new MessageResponse("Feedback submitted successfully!"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Error creating feedback: " + e.getMessage()));
        }
    }

    // Get user's feedbacks (authenticated users)
    @GetMapping("/my-feedback")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Feedback>> getUserFeedbacks(Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            Optional<User> userOpt = userRepository.findByEmail(userPrincipal.getEmail());
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            List<Feedback> userFeedbacks = feedbackRepository.findByUserAndIsVisibleTrueOrderByCreatedAtDesc(userOpt.get());
            return ResponseEntity.ok(userFeedbacks);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Admin endpoints
    // Get all feedbacks for admin with pagination
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Feedback>> getAllFeedbacksForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Feedback> feedbackPage = feedbackRepository.findByIsVisibleTrueOrderByCreatedAtDesc(pageable);
            return ResponseEntity.ok(feedbackPage.getContent());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get pending feedbacks for admin
    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Feedback>> getPendingFeedbacks() {
        try {
            List<Feedback> pendingFeedbacks = feedbackRepository.findByIsApprovedFalseAndIsVisibleTrueOrderByCreatedAtDesc();
            return ResponseEntity.ok(pendingFeedbacks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // This endpoint allows an admin to approve feedback.
    @PutMapping("/admin/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveFeedback(@PathVariable String id) {
        try {
            Optional<Feedback> feedbackOpt = feedbackRepository.findById(id);
            if (!feedbackOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Feedback feedback = feedbackOpt.get();
            feedback.setApproved(true);
            feedbackRepository.save(feedback);

            return ResponseEntity.ok(new MessageResponse("Feedback approved successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Error approving feedback: " + e.getMessage()));
        }
    }

    // This endpoint allows an admin to delete feedback.
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteFeedback(@PathVariable String id) {
        try {
            Optional<Feedback> feedbackOpt = feedbackRepository.findById(id);
            if (!feedbackOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Feedback feedback = feedbackOpt.get();
            feedback.setVisible(false);
            feedbackRepository.save(feedback);

            return ResponseEntity.ok(new MessageResponse("Feedback deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Error deleting feedback: " + e.getMessage()));
        }
    }
}
