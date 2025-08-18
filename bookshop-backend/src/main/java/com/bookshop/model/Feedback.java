package com.bookshop.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

import java.time.LocalDateTime;

// Represents feedback from users about books or services in the bookshop application
@Document(collection = "feedbacks")
public class Feedback {
    @Id
    private String id;

    @DBRef
    private User user;

    @NotBlank
    @Size(min = 2, max = 100)
    private String customerName;

    @NotBlank
    @Size(min = 10, max = 1000)
    private String comment;

    @Min(1)
    @Max(5)
    private int rating;

    private String feedbackType; // "book" or "service"
    
    @DBRef
    private Book book; // Optional: for book-specific feedback

    private boolean isApproved = false; // Admin approval for display
    private boolean isVisible = true; // For soft delete

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // Constructors
    public Feedback() {}

    public Feedback(User user, String customerName, String comment, int rating, String feedbackType) {
        this.user = user;
        this.customerName = customerName;
        this.comment = comment;
        this.rating = rating;
        this.feedbackType = feedbackType;
    }

    public Feedback(User user, String customerName, String comment, int rating, String feedbackType, Book book) {
        this.user = user;
        this.customerName = customerName;
        this.comment = comment;
        this.rating = rating;
        this.feedbackType = feedbackType;
        this.book = book;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getFeedbackType() {
        return feedbackType;
    }

    public void setFeedbackType(String feedbackType) {
        this.feedbackType = feedbackType;
    }

    public Book getBook() {
        return book;
    }

    public void setBook(Book book) {
        this.book = book;
    }

    public boolean isApproved() {
        return isApproved;
    }

    public void setApproved(boolean approved) {
        isApproved = approved;
    }

    public boolean isVisible() {
        return isVisible;
    }

    public void setVisible(boolean visible) {
        isVisible = visible;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
