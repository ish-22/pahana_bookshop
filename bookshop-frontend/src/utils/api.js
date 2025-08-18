// API Service for Bookshop Frontend
const API_BASE_URL = "http://localhost:8080/api";

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
            const headers = this.getAuthHeaders();
            console.log("API Request:", {
                url: `${this.baseURL}${url}`,
                method: options.method || "GET",
                headers: headers,
                hasToken: !!localStorage.getItem("token"),
            });

            const response = await fetch(`${this.baseURL}${url}`, {
                headers: headers,
                ...options,
            });

            console.log("API Response:", {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("API Error Response:", errorData);
                throw new Error(
                    errorData.message ||
                        `HTTP error! status: ${response.status}`
                );
            }

            // Handle empty responses (like 204 No Content from DELETE operations)
            const contentType = response.headers.get("content-type");
            if (
                response.status === 204 ||
                !contentType ||
                !contentType.includes("application/json")
            ) {
                return null; // Return null for empty responses
            }

            return await response.json();
        } catch (error) {
            console.error("API request failed:", error);
            throw error;
        }
    }

    // Authentication APIs
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
        }

        return response;
    }

    async signup(name, email, password) {
        return await this.makeRequest("/auth/signup", {
            method: "POST",
            body: JSON.stringify({ name, email, password }),
        });
    }

    async logout() {
        try {
            await this.makeRequest("/auth/signout", { method: "POST" });
        } catch (error) {
            console.warn("Logout request failed:", error);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("isAuthenticated");
            localStorage.removeItem("cart");
        }
    }

    // Book APIs
    async getAllBooks() {
        return await this.makeRequest("/books");
    }

    async getBookById(id) {
        return await this.makeRequest(`/books/${id}`);
    }

    async searchBooks(query) {
        return await this.makeRequest(
            `/books/search?q=${encodeURIComponent(query)}`
        );
    }

    async getBooksByCategory(category) {
        return await this.makeRequest(
            `/books/category/${encodeURIComponent(category)}`
        );
    }

    async getTopSellingBooks() {
        return await this.makeRequest("/books/top-selling");
    }

    async getAvailableBooks() {
        return await this.makeRequest("/books/available");
    }

    async getBookStats() {
        return await this.makeRequest("/books/stats");
    }

    // Order APIs
    async createOrder(orderData) {
        return await this.makeRequest("/orders", {
            method: "POST",
            body: JSON.stringify(orderData),
        });
    }

    async getUserOrders() {
        return await this.makeRequest("/orders");
    }

    async getOrderById(id) {
        return await this.makeRequest(`/orders/${id}`);
    }

    // User Profile APIs
    async getUserProfile() {
        return await this.makeRequest("/user/profile");
    }

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

    async createBook(bookData) {
        return await this.makeRequest("/admin/books", {
            method: "POST",
            body: JSON.stringify(bookData),
        });
    }

    async updateBook(id, bookData) {
        return await this.makeRequest(`/admin/books/${id}`, {
            method: "PUT",
            body: JSON.stringify(bookData),
        });
    }

    async deleteBook(id) {
        return await this.makeRequest(`/admin/books/${id}`, {
            method: "DELETE",
        });
    }

    // Admin User Management
    async getAllUsers() {
        return await this.makeRequest("/admin/users");
    }

    async updateUserStatus(id, status) {
        return await this.makeRequest(`/admin/users/${id}/status`, {
            method: "PUT",
            body: JSON.stringify({ status }),
        });
    }

    async deleteUser(id) {
        return await this.makeRequest(`/admin/users/${id}`, {
            method: "DELETE",
        });
    }

    // Admin Order Management
    async getAllOrders() {
        return await this.makeRequest("/admin/orders");
    }

    async updateOrderStatus(id, status) {
        return await this.makeRequest(`/admin/orders/${id}/status`, {
            method: "PUT",
            body: JSON.stringify({ status }),
        });
    }

    async deleteOrder(id) {
        return await this.makeRequest(`/admin/orders/${id}`, {
            method: "DELETE",
        });
    }

    // Convenience methods for common patterns
    async get(endpoint) {
        return await this.makeRequest(endpoint);
    }

    async post(endpoint, data) {
        console.log("POST Request Details:", {
            endpoint,
            data,
            token: localStorage.getItem("token")?.substring(0, 20) + "...",
        });

        return await this.makeRequest(endpoint, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async put(endpoint, data) {
        return await this.makeRequest(endpoint, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    async delete(endpoint) {
        return await this.makeRequest(endpoint, {
            method: "DELETE",
        });
    }

    // Feedback Methods
    // Get public feedbacks for home page
    async getPublicFeedbacks(page = 0, size = 10) {
        const params = size > 0 ? `?page=${page}&size=${size}` : "";
        console.log(this.makeRequest(`/feedback/public${params}`));
        return this.makeRequest(`/feedback/public${params}`);
    }

    // Get feedbacks by type (service or book)
    async getFeedbacksByType(type) {
        return this.makeRequest(`/feedback/public/type/${type}`);
    }

    // Create new feedback (authenticated users only)
    async createFeedback(feedbackData) {
        return this.makeRequest("/feedback", {
            method: "POST",
            body: JSON.stringify(feedbackData),
        });
    }

    // Get user's own feedbacks
    async getUserFeedbacks() {
        return this.makeRequest("/feedback/my-feedback");
    }

    // Admin: Get all feedbacks
    async getAllFeedbacksAdmin(page = 0, size = 20) {
        return this.makeRequest(
            `/feedback/admin/all?page=${page}&size=${size}`
        );
    }

    // Admin: Get pending feedbacks
    async getPendingFeedbacks() {
        return this.makeRequest("/feedback/admin/pending");
    }

    // Admin: Approve feedback
    async approveFeedback(feedbackId) {
        return this.makeRequest(`/feedback/admin/${feedbackId}/approve`, {
            method: "PUT",
        });
    }

    // Admin: Delete feedback
    async deleteFeedback(feedbackId) {
        return this.makeRequest(`/feedback/admin/${feedbackId}`, {
            method: "DELETE",
        });
    }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Also export named functions for easier importing
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
    getPublicFeedbacks,
    getFeedbacksByType,
    createFeedback,
    getUserFeedbacks,
    getAllFeedbacksAdmin,
    getPendingFeedbacks,
    approveFeedback,
    deleteFeedback,
} = apiService;
