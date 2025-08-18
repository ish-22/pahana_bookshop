import React, { useState, useEffect } from "react";
import {
    ArrowLeft,
    CreditCard,
    MapPin,
    Lock,
    ShoppingCart,
    Check,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { useCart } from "../../hooks/useCart";

export default function Checkout() {
    // Use the global cart management hook
    const { cart, clearCart } = useCart();
    const [user, setUser] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);

    const navigate = useNavigate();

    const [shippingInfo, setShippingInfo] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "Sri Lanka",
    });

    const [paymentInfo, setPaymentInfo] = useState({
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        nameOnCard: "",
        billingAddressSame: true,
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        // Check if user is authenticated
        const userData = localStorage.getItem("user");
        const isAuthenticated = localStorage.getItem("isAuthenticated");

        if (!isAuthenticated || !userData) {
            navigate("/login", {
                state: { from: { pathname: "/checkout" } },
            });
            return;
        }

        setUser(JSON.parse(userData));

        // If cart is empty, redirect to books page
        if (cart.length === 0) {
            navigate("/books");
        }

        // Pre-fill email from user data
        setShippingInfo((prev) => ({
            ...prev,
            email: JSON.parse(userData).email,
        }));
    }, [navigate, cart.length]);

    const calculateSubtotal = () => {
        return cart.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );
    };

    const calculateTax = () => {
        return calculateSubtotal() * 0.08;
    };

    const calculateShipping = () => {
        return calculateSubtotal() > 50 ? 0 : 9.99;
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax() + calculateShipping();
    };

    // Real-time field validation
    const validateField = (name, value, isPayment = false) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex =
            /^[\+]?[\s\.\-\(\)]?([0-9]{1,4})[\s\.\-\(\)]?([0-9]{1,4})[\s\.\-\(\)]?([0-9]{1,4})[\s\.\-\(\)]?([0-9]{1,4})[\s\.\-\(\)]?([0-9]{1,4})[\s\.\-\(\)]?$/;
        const zipRegex = /^\d{5}(-\d{4})?$/;
        const nameRegex = /^[a-zA-Z\s\-']+$/;
        const cardNameRegex = /^[a-zA-Z\s\-'\.]+$/;
        const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
        const cvvRegex = /^\d{3,4}$/;

        switch (name) {
            case "firstName":
            case "lastName":
                if (!value.trim())
                    return `${
                        name === "firstName" ? "First" : "Last"
                    } name is required`;
                if (value.trim().length < 2)
                    return `${
                        name === "firstName" ? "First" : "Last"
                    } name must be at least 2 characters long`;
                if (value.trim().length > 50)
                    return `${
                        name === "firstName" ? "First" : "Last"
                    } name must be less than 50 characters`;
                if (!nameRegex.test(value.trim()))
                    return `${
                        name === "firstName" ? "First" : "Last"
                    } name can only contain letters, spaces, hyphens, and apostrophes`;
                break;
            case "email":
                if (!value.trim()) return "Email is required";
                if (!emailRegex.test(value.trim()))
                    return "Please enter a valid email address";
                if (value.trim().length > 100)
                    return "Email must be less than 100 characters";
                break;
            case "phone":
                if (!value.trim()) return "Phone number is required";
                if (!phoneRegex.test(value.trim()))
                    return "Please enter a valid phone number";
                if (value.replace(/\D/g, "").length < 10)
                    return "Phone number must be at least 10 digits";
                break;
            case "address":
                if (!value.trim()) return "Address is required";
                if (value.trim().length < 10)
                    return "Address must be at least 10 characters long";
                if (value.trim().length > 200)
                    return "Address must be less than 200 characters";
                break;
            case "city":
                if (!value.trim()) return "City is required";
                if (value.trim().length < 2)
                    return "City must be at least 2 characters long";
                if (value.trim().length > 50)
                    return "City must be less than 50 characters";
                if (!nameRegex.test(value.trim()))
                    return "City can only contain letters, spaces, hyphens, and apostrophes";
                break;
            case "state":
                if (!value.trim()) return "State is required";
                if (value.trim().length < 2)
                    return "State must be at least 2 characters long";
                if (value.trim().length > 50)
                    return "State must be less than 50 characters";
                break;
            case "zipCode":
                if (!value.trim()) return "ZIP code is required";
                if (!zipRegex.test(value.trim()))
                    return "Please enter a valid ZIP code (e.g., 12345 or 12345-6789)";
                break;
            case "cardNumber":
                const cardNumberClean = value.replace(/\s/g, "");
                if (!cardNumberClean) return "Card number is required";
                if (cardNumberClean.length !== 16)
                    return "Card number must be 16 digits";
                if (!/^\d{16}$/.test(cardNumberClean))
                    return "Card number must contain only digits";
                break;
            case "expiryDate":
                if (!value) return "Expiry date is required";
                if (!expiryRegex.test(value))
                    return "Please enter expiry date in MM/YY format";
                const [month, year] = value.split("/");
                const currentDate = new Date();
                const currentYear = currentDate.getFullYear() % 100;
                const currentMonth = currentDate.getMonth() + 1;
                const expYear = parseInt(year);
                const expMonth = parseInt(month);
                if (
                    expYear < currentYear ||
                    (expYear === currentYear && expMonth < currentMonth)
                ) {
                    return "Card has expired";
                }
                if (expYear > currentYear + 10)
                    return "Expiry date seems too far in the future";
                break;
            case "cvv":
                if (!value) return "CVV is required";
                if (!cvvRegex.test(value)) return "CVV must be 3 or 4 digits";
                break;
            case "nameOnCard":
                if (!value.trim()) return "Name on card is required";
                if (value.trim().length < 2)
                    return "Name must be at least 2 characters long";
                if (value.trim().length > 50)
                    return "Name must be less than 50 characters";
                if (!cardNameRegex.test(value.trim()))
                    return "Name can only contain letters, spaces, hyphens, apostrophes, and periods";
                break;
            default:
                break;
        }
        return null;
    };

    const handleShippingChange = (e) => {
        const { name, value } = e.target;
        setShippingInfo((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Real-time validation
        const error = validateField(name, value);
        setErrors((prev) => ({
            ...prev,
            [name]: error || "",
        }));
    };

    const handlePaymentChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === "checkbox") {
            setPaymentInfo((prev) => ({
                ...prev,
                [name]: checked,
            }));
        } else {
            let formattedValue = value;

            // Format card number
            if (name === "cardNumber") {
                formattedValue = value
                    .replace(/\s/g, "")
                    .replace(/(.{4})/g, "$1 ")
                    .trim();
                if (formattedValue.length > 19)
                    formattedValue = formattedValue.substr(0, 19);
            }

            // Format expiry date
            if (name === "expiryDate") {
                formattedValue = value
                    .replace(/\D/g, "")
                    .replace(/(\d{2})(\d)/, "$1/$2");
                if (formattedValue.length > 5)
                    formattedValue = formattedValue.substr(0, 5);
            }

            // Format CVV
            if (name === "cvv") {
                formattedValue = value.replace(/\D/g, "");
                if (formattedValue.length > 4)
                    formattedValue = formattedValue.substr(0, 4);
            }

            setPaymentInfo((prev) => ({
                ...prev,
                [name]: formattedValue,
            }));

            // Real-time validation for payment fields
            const error = validateField(name, formattedValue, true);
            setErrors((prev) => ({
                ...prev,
                [name]: error || "",
            }));
        }
    };

    const validateShipping = () => {
        const newErrors = {};

        //regex patterns

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex =
            /^[\+]?[\s\.\-\(\)]?([0-9]{1,4})[\s\.\-\(\)]?([0-9]{1,4})[\s\.\-\(\)]?([0-9]{1,4})[\s\.\-\(\)]?([0-9]{1,4})[\s\.\-\(\)]?([0-9]{1,4})[\s\.\-\(\)]?$/;
        const zipRegex = /^\d{5}(-\d{4})?$/;
        const nameRegex = /^[a-zA-Z\s\-']+$/;

        // First Name validation
        if (!shippingInfo.firstName.trim()) {
            newErrors.firstName = "First name is required";
        } else if (shippingInfo.firstName.trim().length < 2) {
            newErrors.firstName =
                "First name must be at least 2 characters long";
        } else if (shippingInfo.firstName.trim().length > 50) {
            newErrors.firstName = "First name must be less than 50 characters";
        } else if (!nameRegex.test(shippingInfo.firstName.trim())) {
            newErrors.firstName =
                "First name can only contain letters, spaces, hyphens, and apostrophes";
        }

        // Last Name validation
        if (!shippingInfo.lastName.trim()) {
            newErrors.lastName = "Last name is required";
        } else if (shippingInfo.lastName.trim().length < 2) {
            newErrors.lastName = "Last name must be at least 2 characters long";
        } else if (shippingInfo.lastName.trim().length > 50) {
            newErrors.lastName = "Last name must be less than 50 characters";
        } else if (!nameRegex.test(shippingInfo.lastName.trim())) {
            newErrors.lastName =
                "Last name can only contain letters, spaces, hyphens, and apostrophes";
        }

        // Email validation
        if (!shippingInfo.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(shippingInfo.email.trim())) {
            newErrors.email = "Please enter a valid email address";
        } else if (shippingInfo.email.trim().length > 100) {
            newErrors.email = "Email must be less than 100 characters";
        }

        // Phone validation
        if (!shippingInfo.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!phoneRegex.test(shippingInfo.phone.trim())) {
            newErrors.phone = "Please enter a valid phone number";
        } else if (shippingInfo.phone.replace(/\D/g, "").length < 10) {
            newErrors.phone = "Phone number must be at least 10 digits";
        }

        // Address validation
        if (!shippingInfo.address.trim()) {
            newErrors.address = "Address is required";
        } else if (shippingInfo.address.trim().length < 10) {
            newErrors.address = "Address must be at least 10 characters long";
        } else if (shippingInfo.address.trim().length > 200) {
            newErrors.address = "Address must be less than 200 characters";
        }

        // City validation
        if (!shippingInfo.city.trim()) {
            newErrors.city = "City is required";
        } else if (shippingInfo.city.trim().length < 2) {
            newErrors.city = "City must be at least 2 characters long";
        } else if (shippingInfo.city.trim().length > 50) {
            newErrors.city = "City must be less than 50 characters";
        } else if (!nameRegex.test(shippingInfo.city.trim())) {
            newErrors.city =
                "City can only contain letters, spaces, hyphens, and apostrophes";
        }

        // State validation
        if (!shippingInfo.state.trim()) {
            newErrors.state = "State is required";
        } else if (shippingInfo.state.trim().length < 2) {
            newErrors.state = "State must be at least 2 characters long";
        } else if (shippingInfo.state.trim().length > 50) {
            newErrors.state = "State must be less than 50 characters";
        }

        // ZIP Code validation
        if (!shippingInfo.zipCode.trim()) {
            newErrors.zipCode = "ZIP code is required";
        } else if (!zipRegex.test(shippingInfo.zipCode.trim())) {
            newErrors.zipCode =
                "Please enter a valid ZIP code (e.g., 12345 or 12345-6789)";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validatePayment = () => {
        const newErrors = {};

        // Credit card regex patterns
        const cardNumberRegex = /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/;
        const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
        const cvvRegex = /^\d{3,4}$/;
        const nameRegex = /^[a-zA-Z\s\-'\.]+$/;

        // Card Number validation
        const cardNumberClean = paymentInfo.cardNumber.replace(/\s/g, "");
        if (!cardNumberClean) {
            newErrors.cardNumber = "Card number is required";
        } else if (cardNumberClean.length !== 16) {
            newErrors.cardNumber = "Card number must be 16 digits";
        } else if (!/^\d{16}$/.test(cardNumberClean)) {
            newErrors.cardNumber = "Card number must contain only digits";
        }

        // Expiry Date validation
        if (!paymentInfo.expiryDate) {
            newErrors.expiryDate = "Expiry date is required";
        } else if (!expiryRegex.test(paymentInfo.expiryDate)) {
            newErrors.expiryDate = "Please enter expiry date in MM/YY format";
        } else {
            const [month, year] = paymentInfo.expiryDate.split("/");
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear() % 100;
            const currentMonth = currentDate.getMonth() + 1;
            const expYear = parseInt(year);
            const expMonth = parseInt(month);

            if (
                expYear < currentYear ||
                (expYear === currentYear && expMonth < currentMonth)
            ) {
                newErrors.expiryDate = "Card has expired";
            } else if (expYear > currentYear + 10) {
                newErrors.expiryDate =
                    "Expiry date seems too far in the future";
            }
        }

        // CVV validation
        if (!paymentInfo.cvv) {
            newErrors.cvv = "CVV is required";
        } else if (!cvvRegex.test(paymentInfo.cvv)) {
            newErrors.cvv = "CVV must be 3 or 4 digits";
        }

        // Name on Card validation
        if (!paymentInfo.nameOnCard.trim()) {
            newErrors.nameOnCard = "Name on card is required";
        } else if (paymentInfo.nameOnCard.trim().length < 2) {
            newErrors.nameOnCard = "Name must be at least 2 characters long";
        } else if (paymentInfo.nameOnCard.trim().length > 50) {
            newErrors.nameOnCard = "Name must be less than 50 characters";
        } else if (!nameRegex.test(paymentInfo.nameOnCard.trim())) {
            newErrors.nameOnCard =
                "Name can only contain letters, spaces, hyphens, apostrophes, and periods";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = () => {
        if (currentStep === 1 && validateShipping()) {
            setCurrentStep(2);
        } else if (currentStep === 2 && validatePayment()) {
            setCurrentStep(3);
        }
    };

    const handlePlaceOrder = async () => {
        setIsProcessing(true);
        setErrors({});

        try {
            // Prepare order data
            const orderData = {
                items: cart.map((item) => ({
                    bookId: item.id,
                    quantity: item.quantity,
                })),
                shippingInfo: shippingInfo,
                paymentInfo: {
                    cardNumber: paymentInfo.cardNumber,
                    nameOnCard: paymentInfo.nameOnCard,
                    expiryDate: paymentInfo.expiryDate,
                },
            };

            // Create order via API
            console.log("Creating order with data:", orderData);
            console.log("Current user:", user);
            console.log(
                "Token in localStorage:",
                localStorage.getItem("token")
            );
            console.log(
                "isAuthenticated:",
                localStorage.getItem("isAuthenticated")
            );

            // Check if token is still valid by testing with a simple API call first
            try {
                await api.get("/books"); // Test authentication with a simple call
                console.log("Token validation successful");
            } catch (authError) {
                console.error("Token validation failed:", authError);
                // If token is invalid, show error message and ask user to re-login
                setErrors({
                    submit: "Your session has expired. Please logout and login again to continue.",
                });
                setIsProcessing(false);
                return;
            }

            const response = await api.post("/orders", orderData);
            console.log("Order response:", response);
            const order = response;

            // Store cart data before clearing for navigation
            const navigationData = {
                orderNumber: order.orderNumber || order.id,
                total: order.total || order.totalAmount || calculateTotal(),
                orderId: order.id,
                customerInfo: shippingInfo,
                orderItems: cart,
                subtotal: calculateSubtotal(),
                tax: calculateTax(),
                shipping: calculateShipping(),
            };

            console.log("About to navigate with data:", navigationData);

            // Navigate to confirmation page with order data
            navigate("/order-confirmation", {
                state: navigationData,
            });

            // Clear cart after a short delay to ensure navigation completes
            setTimeout(() => {
                clearCart();
                console.log("Cart cleared after navigation");
            }, 100);
        } catch (error) {
            console.error("Order creation failed:", error);
            console.error("Error details:", {
                message: error.message,
                response: error.response,
                status: error.status,
            });

            const errorMessage =
                error.message || "Failed to place order. Please try again.";
            setErrors({ submit: errorMessage });
        } finally {
            setIsProcessing(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-amber-50 flex items-center justify-center">
                <div className="text-center">
                    <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Your cart is empty
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Add some books to your cart to proceed with checkout.
                    </p>
                    <Link
                        to="/books"
                        className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-amber-50">
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/books"
                            className="flex items-center gap-2 text-amber-600 hover:text-amber-700 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Back to Books
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Checkout
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                            <div className="flex items-center">
                                <div
                                    className={`flex items-center ${
                                        currentStep >= 1
                                            ? "text-amber-600"
                                            : "text-gray-400"
                                    }`}
                                >
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                                            currentStep >= 1
                                                ? "bg-amber-600 text-white"
                                                : "bg-gray-200"
                                        }`}
                                    >
                                        1
                                    </div>
                                    <span className="ml-2 font-medium">
                                        Shipping
                                    </span>
                                </div>
                                <div
                                    className={`flex-1 h-1 mx-4 ${
                                        currentStep >= 2
                                            ? "bg-amber-600"
                                            : "bg-gray-200"
                                    }`}
                                ></div>
                                <div
                                    className={`flex items-center ${
                                        currentStep >= 2
                                            ? "text-amber-600"
                                            : "text-gray-400"
                                    }`}
                                >
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                                            currentStep >= 2
                                                ? "bg-amber-600 text-white"
                                                : "bg-gray-200"
                                        }`}
                                    >
                                        2
                                    </div>
                                    <span className="ml-2 font-medium">
                                        Payment
                                    </span>
                                </div>
                                <div
                                    className={`flex-1 h-1 mx-4 ${
                                        currentStep >= 3
                                            ? "bg-amber-600"
                                            : "bg-gray-200"
                                    }`}
                                ></div>
                                <div
                                    className={`flex items-center ${
                                        currentStep >= 3
                                            ? "text-amber-600"
                                            : "text-gray-400"
                                    }`}
                                >
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                                            currentStep >= 3
                                                ? "bg-amber-600 text-white"
                                                : "bg-gray-200"
                                        }`}
                                    >
                                        3
                                    </div>
                                    <span className="ml-2 font-medium">
                                        Review
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Step 1: Shipping Information */}
                        {currentStep === 1 && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Shipping Information
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={shippingInfo.firstName}
                                            onChange={handleShippingChange}
                                            placeholder="Enter your first name"
                                            maxLength="50"
                                            autoComplete="given-name"
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                                                errors.firstName
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-300"
                                            }`}
                                        />
                                        {errors.firstName && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.firstName}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={shippingInfo.lastName}
                                            onChange={handleShippingChange}
                                            placeholder="Enter your last name"
                                            maxLength="50"
                                            autoComplete="family-name"
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                                                errors.lastName
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-300"
                                            }`}
                                        />
                                        {errors.lastName && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.lastName}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={shippingInfo.email}
                                            onChange={handleShippingChange}
                                            placeholder="Enter your email address"
                                            maxLength="100"
                                            autoComplete="email"
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                                                errors.email
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-300"
                                            }`}
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={shippingInfo.phone}
                                            onChange={handleShippingChange}
                                            placeholder="Enter your phone number"
                                            autoComplete="tel"
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                                                errors.phone
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-300"
                                            }`}
                                        />
                                        {errors.phone && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.phone}
                                            </p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Address *
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={shippingInfo.address}
                                            onChange={handleShippingChange}
                                            placeholder="Enter your full address"
                                            maxLength="200"
                                            autoComplete="street-address"
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                                                errors.address
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-300"
                                            }`}
                                        />
                                        {errors.address && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.address}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={shippingInfo.city}
                                            onChange={handleShippingChange}
                                            placeholder="Enter your city"
                                            maxLength="50"
                                            autoComplete="address-level2"
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                                                errors.city
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-300"
                                            }`}
                                        />
                                        {errors.city && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.city}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Province *
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={shippingInfo.state}
                                            onChange={handleShippingChange}
                                            placeholder="Enter your state"
                                            maxLength="50"
                                            autoComplete="address-level1"
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                                                errors.state
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-300"
                                            }`}
                                        />
                                        {errors.state && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.state}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ZIP Code *
                                        </label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            value={shippingInfo.zipCode}
                                            onChange={handleShippingChange}
                                            placeholder="Enter ZIP code (e.g., 12345)"
                                            maxLength="10"
                                            autoComplete="postal-code"
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                                                errors.zipCode
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-300"
                                            }`}
                                        />
                                        {errors.zipCode && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.zipCode}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Country
                                        </label>
                                        <select
                                            name="country"
                                            value={shippingInfo.country}
                                            onChange={handleShippingChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                        >
                                            <option value="Sri Lanka">
                                                Sri Lanka
                                            </option>
                                            <option value="Canada">
                                                Canada
                                            </option>
                                            <option value="United Kingdom">
                                                United Kingdom
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end mt-6">
                                    <button
                                        onClick={handleNextStep}
                                        className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors font-medium"
                                    >
                                        Continue to Payment
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Payment Information */}
                        {currentStep === 2 && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Payment Information
                                </h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Card Number *
                                        </label>
                                        <input
                                            type="text"
                                            name="cardNumber"
                                            value={paymentInfo.cardNumber}
                                            onChange={handlePaymentChange}
                                            placeholder="1234 5678 9012 3456"
                                            maxLength="19"
                                            autoComplete="cc-number"
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                                                errors.cardNumber
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-300"
                                            }`}
                                        />
                                        {errors.cardNumber && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.cardNumber}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Expiry Date *
                                            </label>
                                            <input
                                                type="text"
                                                name="expiryDate"
                                                value={paymentInfo.expiryDate}
                                                onChange={handlePaymentChange}
                                                placeholder="MM/YY"
                                                maxLength="5"
                                                autoComplete="cc-exp"
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                                                    errors.expiryDate
                                                        ? "border-red-300 bg-red-50"
                                                        : "border-gray-300"
                                                }`}
                                            />
                                            {errors.expiryDate && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.expiryDate}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                CVV *
                                            </label>
                                            <input
                                                type="text"
                                                name="cvv"
                                                value={paymentInfo.cvv}
                                                onChange={handlePaymentChange}
                                                placeholder="123"
                                                maxLength="4"
                                                autoComplete="cc-csc"
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                                                    errors.cvv
                                                        ? "border-red-300 bg-red-50"
                                                        : "border-gray-300"
                                                }`}
                                            />
                                            {errors.cvv && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.cvv}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Name on Card *
                                        </label>
                                        <input
                                            type="text"
                                            name="nameOnCard"
                                            value={paymentInfo.nameOnCard}
                                            onChange={handlePaymentChange}
                                            placeholder="Enter name as it appears on card"
                                            maxLength="50"
                                            autoComplete="cc-name"
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                                                errors.nameOnCard
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-300"
                                            }`}
                                        />
                                        {errors.nameOnCard && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.nameOnCard}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="billingAddressSame"
                                                checked={
                                                    paymentInfo.billingAddressSame
                                                }
                                                onChange={handlePaymentChange}
                                                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">
                                                Billing address is the same as
                                                shipping address
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-between mt-6">
                                    <button
                                        onClick={() => setCurrentStep(1)}
                                        className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                    >
                                        Back to Shipping
                                    </button>
                                    <button
                                        onClick={handleNextStep}
                                        className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors font-medium"
                                    >
                                        Review Order
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Review Order */}
                        {currentStep === 3 && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                    Review Your Order
                                </h2>

                                {/* Order Items */}
                                <div className="space-y-4 mb-6">
                                    {cart.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex gap-4 p-4 border rounded-lg"
                                        >
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-16 h-20 object-cover rounded"
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">
                                                    {item.title}
                                                </h3>
                                                <p className="text-gray-600 text-sm">
                                                    {item.author}
                                                </p>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-sm text-gray-600">
                                                        Qty: {item.quantity}
                                                    </span>
                                                    <span className="font-semibold text-amber-600">
                                                        $
                                                        {(
                                                            item.price *
                                                            item.quantity
                                                        ).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Shipping & Payment Summary */}
                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-gray-900 mb-2">
                                            Shipping Address
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {shippingInfo.firstName}{" "}
                                            {shippingInfo.lastName}
                                            <br />
                                            {shippingInfo.address}
                                            <br />
                                            {shippingInfo.city},{" "}
                                            {shippingInfo.state}{" "}
                                            {shippingInfo.zipCode}
                                            <br />
                                            {shippingInfo.country}
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-gray-900 mb-2">
                                            Payment Method
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            **** **** ****{" "}
                                            {paymentInfo.cardNumber.slice(-4)}
                                            <br />
                                            {paymentInfo.nameOnCard}
                                        </p>
                                    </div>
                                </div>

                                {errors.submit && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
                                        {errors.submit}
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <button
                                        onClick={() => setCurrentStep(2)}
                                        className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                    >
                                        Back to Payment
                                    </button>
                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={isProcessing}
                                        className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="h-4 w-4" />
                                                Place Order
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-4 mt-8 lg:mt-0">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Order Summary
                            </h2>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                        Subtotal
                                    </span>
                                    <span className="font-medium">
                                        ${calculateSubtotal().toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                        Shipping
                                    </span>
                                    <span className="font-medium">
                                        {calculateShipping() === 0
                                            ? "Free"
                                            : `$${calculateShipping().toFixed(
                                                  2
                                              )}`}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-medium">
                                        ${calculateTax().toFixed(2)}
                                    </span>
                                </div>
                                <hr />
                                <div className="flex justify-between text-lg font-semibold">
                                    <span>Total</span>
                                    <span className="text-amber-600">
                                        ${calculateTotal().toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {calculateShipping() === 0 && (
                                <div className="bg-green-50 border border-green-200 text-green-800 px-3 py-2 rounded text-sm mb-4">
                                    🎉 You qualify for free shipping!
                                </div>
                            )}

                            <div className="text-xs text-gray-500">
                                <Lock className="h-3 w-3 inline mr-1" />
                                Your payment information is secure and
                                encrypted.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
