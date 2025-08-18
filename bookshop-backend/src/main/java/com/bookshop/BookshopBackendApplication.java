package com.bookshop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class BookshopBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BookshopBackendApplication.class, args);
    }

}
