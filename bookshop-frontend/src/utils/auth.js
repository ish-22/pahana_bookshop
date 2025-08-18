// Authentication utility functions
import apiService from "../services/api.js";
import cartManager from "./cartManager.js";

export const AuthService = {
    // Check if user is authenticated
    isAuthenticated() {
        const isAuth = localStorage.getItem("isAuthenticated");
        const userData = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        return isAuth === "true" && userData !== null && token !== null;
    },

    // Get current user data
    getCurrentUser() {
        try {
            const userData = localStorage.getItem("user");
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error("Error getting user data:", error);
            return null;
        }
    },

    // Login user using API
    async login(email, password) {
        try {
            const response = await apiService.login(email, password);

            // Notify cart manager about login
            cartManager.onLogin();

            return { success: true, user: response };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Signup user using API
    async signup(name, email, password) {
        try {
            const response = await apiService.signup(name, email, password);
            return { success: true, message: response.message };
        } catch (error) {
            console.error("Signup error:", error);
            return { success: false, error: error.message };
        }
    },

    // Logout user
    async logout(shouldClearCart = true) {
        try {
            cartManager.onLogout(shouldClearCart);
            await apiService.logout(shouldClearCart);
        } catch (error) {
            console.error("Logout error:", error);
        }
    },

    // Get user's full name
    getUserName() {
        const user = this.getCurrentUser();
        if (user) {
            return user.name || user.email;
        }
        return "";
    },

    // Check if user is admin
    isAdmin() {
        const user = this.getCurrentUser();
        return (
            user &&
            (user.isAdmin === true || user.roles?.includes("ROLE_ADMIN"))
        );
    },

    // Admin authentication guard
    requireAdmin(navigate) {
        if (!this.isAuthenticated() || !this.isSessionValid()) {
            navigate("/login");
            return false;
        }
        if (!this.isAdmin()) {
            navigate("/");
            return false;
        }
        return true;
    },

    // Check if user session is valid
    isSessionValid() {
        const user = this.getCurrentUser();
        const token = localStorage.getItem("token");

        if (!user || !token) return false;

        // Session valid for 24 hours
        const loginTime = user.loginTime || user.signupTime;
        if (loginTime) {
            const sessionTime = new Date(loginTime).getTime();
            const now = new Date().getTime();
            const hoursPassed = (now - sessionTime) / (1000 * 60 * 60);
            return hoursPassed < 24;
        }
        return true;
    },

    // Get auth token
    getToken() {
        return localStorage.getItem("token");
    },

    // Set user data (for manual updates)
    setUser(userData) {
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("isAuthenticated", "true");
    },
};
