# Pahana Bookshop

Pahana Bookshop is a full-stack online bookshop application with a React frontend and a Spring Boot REST API backend. The system supports browsing books, searching by category, customer registration and login, cart and checkout flows, order creation, feedback, and admin management for books, users, orders, and feedback.

## Project Structure

```text
pahana_bookshop/
|-- bookshop-backend/     # Spring Boot API with MongoDB and JWT security
|-- bookshop-frontend/    # React + Vite frontend
`-- .vscode/              # VS Code task configuration
```

## Tech Stack

- Frontend: React 19, Vite, React Router, Tailwind CSS, lucide-react
- Backend: Java 17, Spring Boot 3.2.1, Spring Security, Spring Data MongoDB
- Database: MongoDB
- Authentication: JWT
- PDF generation: jsPDF

## Main Features

- Public book browsing and search
- User signup, login, and logout
- Shopping cart and checkout
- Order confirmation and invoice generation
- Customer feedback
- Admin book management
- Admin user management
- Admin order management
- Admin feedback management

## Requirements

- Java 17 or higher
- Maven 3.6 or higher
- Node.js 18 or higher
- npm
- MongoDB Atlas or a local MongoDB instance

## Backend Setup

1. Go to the backend folder:

    ```bash
    cd bookshop-backend
    ```

2. Configure MongoDB in:

    ```text
    src/main/resources/application.properties
    ```

    Important settings:

    ```properties
    server.port=8080
    spring.data.mongodb.uri=<your-mongodb-uri>
    spring.data.mongodb.database=bookshop
    bookshop.app.frontend.url=http://localhost:5173
    ```

3. Install dependencies and build:

    ```bash
    mvn clean install
    ```

4. Start the backend:

    ```bash
    mvn spring-boot:run
    ```

The backend runs at:

```text
http://localhost:8080
```

Health check:

```text
http://localhost:8080/api/health
```

## Frontend Setup

1. Open a new terminal and go to the frontend folder:

    ```bash
    cd bookshop-frontend
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Start the development server:

    ```bash
    npm run dev
    ```

The frontend runs at:

```text
http://localhost:5173
```

The frontend API service is configured to call:

```text
http://localhost:8080/api
```

## Default Admin Account

The backend creates this admin account automatically if it does not already exist:

```text
Email: admin@bookshop.com
Password: admin123
```

Use this account to access admin pages such as:

```text
http://localhost:5173/admin/books
http://localhost:5173/admin/users
http://localhost:5173/admin/orders
http://localhost:5173/admin/feedbacks
```

## Useful Commands

Backend:

```bash
cd bookshop-backend
mvn spring-boot:run
mvn clean install
```

Frontend:

```bash
cd bookshop-frontend
npm run dev
npm run build
npm run preview
npm run lint
```

## VS Code Task

This project includes a VS Code task named `Run Bookshop Backend`, which runs:

```bash
mvn spring-boot:run
```

Run it from VS Code using `Terminal > Run Task`.

## API Overview

Common backend endpoints include:

```text
POST /api/auth/signin
POST /api/auth/signup
GET  /api/books
GET  /api/books/search?q=<query>
GET  /api/books/category/<category>
POST /api/orders
GET  /api/orders
GET  /api/user/profile
GET  /api/admin/books
GET  /api/admin/users
GET  /api/admin/orders
GET  /api/admin/feedbacks
```

Protected endpoints require the JWT token returned by login.

## Development Notes

- Start the backend before using the frontend.
- Keep the frontend running on `http://localhost:5173` unless you also update the backend CORS setting.
- Do not commit real production database credentials or JWT secrets. Use local or environment-specific configuration for sensitive values.
