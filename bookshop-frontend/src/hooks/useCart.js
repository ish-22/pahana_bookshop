import { useState, useEffect } from "react";
import cartManager from "../utils/cartManager";

// Custom hook for cart management
export const useCart = () => {
    const [cart, setCart] = useState(cartManager.getCart());

    useEffect(() => {
        // Subscribe to cart changes
        const unsubscribe = cartManager.subscribe((updatedCart) => {
            setCart(updatedCart);
        });

        // Initial cart load
        setCart(cartManager.getCart());

        // Cleanup subscription on unmount
        return unsubscribe;
    }, []);

    const addToCart = (book) => {
        const updatedCart = cartManager.addToCart(book);
        return updatedCart;
    };

    const removeFromCart = (bookId) => {
        const updatedCart = cartManager.removeFromCart(bookId);
        return updatedCart;
    };

    const updateQuantity = (bookId, quantity) => {
        const updatedCart = cartManager.updateQuantity(bookId, quantity);
        return updatedCart;
    };

    const clearCart = () => {
        const updatedCart = cartManager.clearCart();
        return updatedCart;
    };

    const getTotalItems = () => {
        return cartManager.getTotalItems();
    };

    const getTotalPrice = () => {
        return cartManager.getTotalPrice();
    };

    return {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
    };
};
