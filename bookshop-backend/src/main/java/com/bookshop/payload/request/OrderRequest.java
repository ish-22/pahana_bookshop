package com.bookshop.payload.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

// This class represents a request payload for placing an order in the application.
public class OrderRequest {
    @NotEmpty
    private List<OrderItem> items;

    @NotNull
    private ShippingInfo shippingInfo;

    @NotNull
    private PaymentInfo paymentInfo;

    public static class OrderItem {
        @NotNull
        private String bookId;
        
        @NotNull
        private Integer quantity;

        // Getters and Setters
        public String getBookId() { return bookId; }
        public void setBookId(String bookId) { this.bookId = bookId; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }

    public static class ShippingInfo {
        @NotNull
        private String firstName;
        
        @NotNull
        private String lastName;
        
        @NotNull
        private String email;
        
        private String phone;
        
        @NotNull
        private String address;
        
        @NotNull
        private String city;
        
        @NotNull
        private String state;
        
        @NotNull
        private String zipCode;
        
        @NotNull
        private String country;

        // Getters and Setters
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }

        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }

        public String getState() { return state; }
        public void setState(String state) { this.state = state; }

        public String getZipCode() { return zipCode; }
        public void setZipCode(String zipCode) { this.zipCode = zipCode; }

        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
    }

    public static class PaymentInfo {
        @NotNull
        private String cardNumber;
        
        @NotNull
        private String nameOnCard;

        // Getters and Setters
        public String getCardNumber() { return cardNumber; }
        public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }

        public String getNameOnCard() { return nameOnCard; }
        public void setNameOnCard(String nameOnCard) { this.nameOnCard = nameOnCard; }
    }

    // Main class Getters and Setters
    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }

    public ShippingInfo getShippingInfo() {
        return shippingInfo;
    }

    public void setShippingInfo(ShippingInfo shippingInfo) {
        this.shippingInfo = shippingInfo;
    }

    public PaymentInfo getPaymentInfo() {
        return paymentInfo;
    }

    public void setPaymentInfo(PaymentInfo paymentInfo) {
        this.paymentInfo = paymentInfo;
    }
}
