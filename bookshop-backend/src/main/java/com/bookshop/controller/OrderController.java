package com.bookshop.controller;

import com.bookshop.model.Book;
import com.bookshop.model.Order;
import com.bookshop.model.User;
import com.bookshop.payload.request.OrderRequest;
import com.bookshop.payload.response.MessageResponse;
import com.bookshop.repository.BookRepository;
import com.bookshop.repository.OrderRepository;
import com.bookshop.repository.UserRepository;
import com.bookshop.security.services.UserPrincipal;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    // Create a new order
    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> createOrder(@Valid @RequestBody OrderRequest orderRequest, Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findByEmail(userPrincipal.getEmail()).orElse(null);

            if (user == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
            }

            Order order = new Order();
            order.setUser(user);
            order.setUserEmail(user.getEmail());
            
            String orderNumber = "ORD-" + System.currentTimeMillis();
            order.setOrderNumber(orderNumber);
            
            String customerName = user.getName();
            order.setCustomerName(customerName);

            List<Order.OrderItem> orderItems = new ArrayList<>();
            BigDecimal total = BigDecimal.ZERO;

            for (OrderRequest.OrderItem requestItem : orderRequest.getItems()) {
                Optional<Book> bookOpt = bookRepository.findById(requestItem.getBookId());
                if (bookOpt.isEmpty()) {
                    continue;
                }

                Book book = bookOpt.get();
                
                if (book.getStock() < requestItem.getQuantity()) {
                    return ResponseEntity.badRequest()
                            .body(new MessageResponse("Insufficient stock for book: " + book.getTitle()));
                }

                Order.OrderItem orderItem = new Order.OrderItem(
                        book.getId(),
                        book.getTitle(),
                        book.getAuthor(),
                        book.getPrice(),
                        requestItem.getQuantity(),
                        book.getImage()
                );

                orderItems.add(orderItem);
                total = total.add(book.getPrice().multiply(BigDecimal.valueOf(requestItem.getQuantity())));

                // Update book stock and total sold
                book.setStock(book.getStock() - requestItem.getQuantity());
                book.setTotalSold(book.getTotalSold() + requestItem.getQuantity());
                bookRepository.save(book);
            }

            order.setItems(orderItems);
            order.setTotal(total);

            // Set shipping info
            Order.ShippingInfo shippingInfo = new Order.ShippingInfo();
            shippingInfo.setFirstName(orderRequest.getShippingInfo().getFirstName());
            shippingInfo.setLastName(orderRequest.getShippingInfo().getLastName());
            shippingInfo.setEmail(orderRequest.getShippingInfo().getEmail());
            shippingInfo.setPhone(orderRequest.getShippingInfo().getPhone());
            shippingInfo.setAddress(orderRequest.getShippingInfo().getAddress());
            shippingInfo.setCity(orderRequest.getShippingInfo().getCity());
            shippingInfo.setState(orderRequest.getShippingInfo().getState());
            shippingInfo.setZipCode(orderRequest.getShippingInfo().getZipCode());
            shippingInfo.setCountry(orderRequest.getShippingInfo().getCountry());
            order.setShippingInfo(shippingInfo);

            // Set payment info (in real app, this should be encrypted/tokenized)
            Order.PaymentInfo paymentInfo = new Order.PaymentInfo();
            paymentInfo.setCardNumber("****-****-****-" + orderRequest.getPaymentInfo().getCardNumber().substring(Math.max(0, orderRequest.getPaymentInfo().getCardNumber().length() - 4)));
            paymentInfo.setNameOnCard(orderRequest.getPaymentInfo().getNameOnCard());
            order.setPaymentInfo(paymentInfo);

            order.setStatus("processing");

            Order savedOrder = orderRepository.save(order);
            return ResponseEntity.ok(savedOrder);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error creating order: " + e.getMessage()));
        }
    }

    // Get all orders for the authenticated user
    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Order>> getUserOrders(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findByEmail(userPrincipal.getEmail()).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().build();
        }

        List<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(user);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Order> getOrderById(@PathVariable String id, Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findByEmail(userPrincipal.getEmail()).orElse(null);

        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Order order = orderOpt.get();
        
        // Check if user owns this order or is admin
        if (!order.getUser().getId().equals(user.getId()) && !user.getRoles().contains(com.bookshop.model.Role.ROLE_ADMIN)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(order);
    }
}
