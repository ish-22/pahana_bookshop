# Bookshop Backend

Spring Boot REST API for an online bookshop management system.

## 📋 Requirements

-   **Java**: 17 or higher
-   **Maven**: 3.6 or higher
-   **MongoDB**: MongoDB Atlas account or local MongoDB instance

## 🛠️ Setup

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd bookshop-backend
    ```

2. **Configure MongoDB**

    - Create a MongoDB Atlas cluster or use local MongoDB
    - Update `src/main/resources/application.properties`:

    ```properties
    spring.data.mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net/bookshop
    ```

3. **Install dependencies**
    ```bash
    mvn clean install
    ```

## 🚀 How to Run

1. **Start the application**

    ```bash
    mvn spring-boot:run
    ```

2. **Application will be available at**

    ```
    http://localhost:8080
    ```

3. **Default Admin Account**
    - Email: `admin@bookshop.com`
    - Password: `admin123`

## 📚 Key API Endpoints

-   `POST /api/auth/signin` - User login
-   `POST /api/auth/signup` - User registration
-   `GET /api/books` - Get all books
-   `POST /api/orders` - Create order (authenticated)
-   `GET /api/admin/books` - Admin book management
