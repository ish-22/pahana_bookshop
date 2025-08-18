// Global Cart Management System
// This ensures cart persistence across all pages and navigation

class CartManager {
    constructor() {
        this.CART_KEY = "bookshop_cart";
        this.listeners = new Set();

        // Initialize cart from localStorage
        this.cart = this.loadCart();

        // Listen for storage events from other tabs
        window.addEventListener("storage", (e) => {
            if (e.key === this.CART_KEY) {
                this.cart = this.loadCart();
                this.notifyListeners();
            }
        });
    }

    // Load cart from localStorage
    loadCart() {
        try {
            const savedCart = localStorage.getItem(this.CART_KEY);
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error("Failed to load cart from localStorage:", error);
            return [];
        }
    }

    // Save cart to localStorage
    saveCart() {
        try {
            localStorage.setItem(this.CART_KEY, JSON.stringify(this.cart));
            this.notifyListeners();
        } catch (error) {
            console.error("Failed to save cart to localStorage:", error);
        }
    }

    // Get current cart
    getCart() {
        return [...this.cart];
    }

    // Add item to cart
    addToCart(book) {
        const existingItem = this.cart.find((item) => item.id === book.id);
        // Update quantity (don't exceed stock)
        if (existingItem) {
            existingItem.quantity = Math.min(
                existingItem.quantity + 1,
                book.stock
            );
        } else {
            // Add new item
            this.cart.push({ ...book, quantity: 1 });
        }

        this.saveCart();
        return this.getCart();
    }

    // Remove item from cart
    removeFromCart(bookId) {
        this.cart = this.cart.filter((item) => item.id !== bookId);
        this.saveCart();
        return this.getCart();
    }

    // Update item quantity
    updateQuantity(bookId, newQuantity) {
        if (newQuantity <= 0) {
            return this.removeFromCart(bookId);
        }

        const item = this.cart.find((item) => item.id === bookId);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart();
        }

        return this.getCart();
    }

    // Clear entire cart
    clearCart() {
        this.cart = [];
        this.saveCart();
        return this.getCart();
    }

    // Get total items count
    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    // Get total price
    getTotalPrice() {
        return this.cart.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );
    }

    // Subscribe to cart changes
    subscribe(callback) {
        this.listeners.add(callback);

        // Return unsubscribe function
        return () => {
            this.listeners.delete(callback);
        };
    }

    // Notify all listeners of cart changes
    notifyListeners() {
        this.listeners.forEach((callback) => {
            try {
                callback(this.getCart());
            } catch (error) {
                console.error("Error in cart listener:", error);
            }
        });
    }

    // Preserve cart during logout (don't clear unless explicitly requested)
    onLogout(shouldClearCart = false) {
        if (shouldClearCart) {
            this.clearCart();
        }
    }

    // Cart is automatically loaded from localStorage
    onLogin() {
        this.notifyListeners();
    }
}

// Create a singleton instance
const cartManager = new CartManager();

export default cartManager;
