package com.bookshop.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

// This class represents a request payload for submitting feedback on a book in the application.
public class FeedbackRequest {
    @NotBlank
    @Size(min = 2, max = 100, message = "Customer name must be between 2 and 100 characters")
    private String customerName;

    @NotBlank
    @Size(min = 10, max = 1000, message = "Comment must be between 10 and 1000 characters")
    private String comment;

    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private int rating;

    @NotBlank
    @Size(min = 3, max = 20, message = "Feedback type must be specified")
    private String feedbackType;

    private String bookId;

    // Constructors
    public FeedbackRequest() {}

    public FeedbackRequest(String customerName, String comment, int rating, String feedbackType) {
        this.customerName = customerName;
        this.comment = comment;
        this.rating = rating;
        this.feedbackType = feedbackType;
    }

    public FeedbackRequest(String customerName, String comment, int rating, String feedbackType, String bookId) {
        this.customerName = customerName;
        this.comment = comment;
        this.rating = rating;
        this.feedbackType = feedbackType;
        this.bookId = bookId;
    }

    // Getters and Setters
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

    public String getBookId() {
        return bookId;
    }

    public void setBookId(String bookId) {
        this.bookId = bookId;
    }
}
