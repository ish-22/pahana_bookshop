// API Service for Bookshop Frontend
const API_BASE_URL = "http://localhost:8080/api";

// Class to handle API requests
class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Helper method to get auth headers
    getAuthHeaders() {
        const token = localStorage.getItem("token");
        return {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        };
    }

    // Helper method for making requests
    async makeRequest(url, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${url}`, {
                headers: this.getAuthHeaders(),
                ...options,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message ||
                        `HTTP error! status: ${response.status}`
                );
            }

            return await response.json();
        } catch (error) {
            console.error("API request failed:", error);
            throw error;
        }
    }

    // Authentication APIs
    //for signin
    async login(email, password) {
        const response = await this.makeRequest("/auth/signin", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });

        // Handle both possible token field names
        const token = response.accessToken || response.token;
        if (token) {
            localStorage.setItem("token", token);
            localStorage.setItem(
                "user",
                JSON.stringify({
                    id: response.id,
                    name: response.name,
                    email: response.email,
                    isAdmin:
                        response.roles && response.roles.includes("ROLE_ADMIN"),
                    roles: response.roles,
                    loginTime: new Date().toISOString(),
                })
            );
            localStorage.setItem("isAuthenticated", "true");

            // Dispatch custom event to notify components about login
            window.dispatchEvent(
                new CustomEvent("authStatusChanged", {
                    detail: {
                        isAuthenticated: true,
                        user: {
                            id: response.id,
                            name: response.name,
                            email: response.email,
                            isAdmin:
                                response.roles &&
                                response.roles.includes("ROLE_ADMIN"),
                            roles: response.roles,
                            loginTime: new Date().toISOString(),
                        },
                    },
                })
            );
        }

        return response;
    }

    //for signup
    async signup(name, email, password) {
        return await this.makeRequest("/auth/signup", {
            method: "POST",
            body: JSON.stringify({ name, email, password }),
        });
    }

    //for logging out
    async logout(shouldClearCart = true) {
        try {
            await this.makeRequest("/auth/signout", { method: "POST" });
        } catch (error) {
            console.warn("Logout request failed:", error);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("isAuthenticated");

            if (shouldClearCart) {
                localStorage.removeItem("cart");
            }

            // Dispatch custom event to notify components about logout
            window.dispatchEvent(
                new CustomEvent("authStatusChanged", {
                    detail: {
                        isAuthenticated: false,
                        user: null,
                        clearCart: shouldClearCart,
                    },
                })
            );
        }
    }

    // Book APIs
    //for getting all books
    async getAllBooks() {
        return await this.makeRequest("/books");
    }

    //for getting a book by id
    async getBookById(id) {
        return await this.makeRequest(`/books/${id}`);
    }

    //for searching books
    async searchBooks(query) {
        return await this.makeRequest(
            `/books/search?q=${encodeURIComponent(query)}`
        );
    }

    //for getting books by category
    async getBooksByCategory(category) {
        return await this.makeRequest(
            `/books/category/${encodeURIComponent(category)}`
        );
    }

    //for getting top selling books
    async getTopSellingBooks() {
        return await this.makeRequest("/books/top-selling");
    }

    //for getting available books
    async getAvailableBooks() {
        return await this.makeRequest("/books/available");
    }

    //for getting book stats
    async getBookStats() {
        return await this.makeRequest("/books/stats");
    }

    // Order APIs
    //for creating an order
    async createOrder(orderData) {
        return await this.makeRequest("/orders", {
            method: "POST",
            body: JSON.stringify(orderData),
        });
    }

    //for getting user orders
    async getUserOrders() {
        return await this.makeRequest("/orders");
    }

    //for getting an order by id
    async getOrderById(id) {
        return await this.makeRequest(`/orders/${id}`);
    }

    // User Profile APIs
    //for getting user profile
    async getUserProfile() {
        return await this.makeRequest("/user/profile");
    }

    //for updating user profile
    async updateUserProfile(profileData) {
        return await this.makeRequest("/user/profile", {
            method: "PUT",
            body: JSON.stringify(profileData),
        });
    }

    async changePassword(currentPassword, newPassword) {
        return await this.makeRequest("/user/change-password", {
            method: "PUT",
            body: JSON.stringify({ currentPassword, newPassword }),
        });
    }

    // Admin APIs
    async getDashboardStats() {
        return await this.makeRequest("/admin/dashboard");
    }

    // Admin Book Management
    async getAllBooksAdmin() {
        return await this.makeRequest("/admin/books");
    }

    //for creating a book
    async createBook(bookData) {
        return await this.makeRequest("/admin/books", {
            method: "POST",
            body: JSON.stringify(bookData),
        });
    }

    //for updating a book
    async updateBook(id, bookData) {
        return await this.makeRequest(`/admin/books/${id}`, {
            method: "PUT",
            body: JSON.stringify(bookData),
        });
    }

    //for deleting a book
    async deleteBook(id) {
        return await this.makeRequest(`/admin/books/${id}`, {
            method: "DELETE",
        });
    }

    // Admin User Management
    async getAllUsers() {
        return await this.makeRequest("/admin/users");
    }

    //for updating user status
    async updateUserStatus(id, status) {
        return await this.makeRequest(`/admin/users/${id}/status`, {
            method: "PUT",
            body: JSON.stringify({ status }),
        });
    }

    //for deleting a user
    async deleteUser(id) {
        return await this.makeRequest(`/admin/users/${id}`, {
            method: "DELETE",
        });
    }

    // Admin Order Management
    //for getting all orders
    async getAllOrders() {
        return await this.makeRequest("/admin/orders");
    }

    //for updating order status
    async updateOrderStatus(id, status) {
        return await this.makeRequest(`/admin/orders/${id}/status`, {
            method: "PUT",
            body: JSON.stringify({ status }),
        });
    }

    //for deleting an order
    async deleteOrder(id) {
        return await this.makeRequest(`/admin/orders/${id}`, {
            method: "DELETE",
        });
    }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

export const {
    login,
    signup,
    logout,
    getAllBooks,
    getBookById,
    searchBooks,
    getBooksByCategory,
    getTopSellingBooks,
    getAvailableBooks,
    getBookStats,
    createOrder,
    getUserOrders,
    getOrderById,
    getUserProfile,
    updateUserProfile,
    changePassword,
    getDashboardStats,
    getAllBooksAdmin,
    createBook,
    updateBook,
    deleteBook,
    getAllUsers,
    updateUserStatus,
    deleteUser,
    getAllOrders,
    updateOrderStatus,
    deleteOrder,
} = apiService;
