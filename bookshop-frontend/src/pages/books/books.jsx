import React, { useState, useMemo, useEffect } from "react";
import {
    Search,
    Filter,
    ShoppingCart,
    Plus,
    Minus,
    X,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Eye,
    Calendar,
    BookOpen,
    User,
    DollarSign,
    Package,
    Check,
} from "lucide-react";
import apiService from "../../services/api.js";
import { AuthService } from "../../utils/auth.js";
import { useCart } from "../../hooks/useCart.js";

const categories = ["All", "Classic", "Science Fiction", "Romance", "Fantasy"];
const sortOptions = [
    { value: "title", label: "Title A-Z" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
];

export default function Books() {
    const [booksData, setBooksData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortBy, setSortBy] = useState("title");
    const [priceRange, setPriceRange] = useState([0, 50]);

    // Use the global cart management hook
    const {
        cart,
        addToCart: addToCartHandler,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
    } = useCart();

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [cartView, setCartView] = useState("dropdown"); // 'dropdown', 'modal', 'mini'
    const [showWelcome, setShowWelcome] = useState(false);
    const [user, setUser] = useState(null);
    const [showAddToCartPopup, setShowAddToCartPopup] = useState(false);
    const [addedBook, setAddedBook] = useState(null);

    // Book Detail Modal states
    const [selectedBook, setSelectedBook] = useState(null);
    const [isBookDetailOpen, setIsBookDetailOpen] = useState(false);
    const [bookDetailQuantity, setBookDetailQuantity] = useState(1);

    const [currentPage, setCurrentPage] = useState(1);
    const booksPerPage = 12;

    // Load books from API
    useEffect(() => {
        const loadBooks = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log("Loading books from database...");
                const books = await apiService.getAllBooks();
                console.log("Books received from API:", books);

                if (books && Array.isArray(books) && books.length > 0) {
                    setBooksData(books);
                    console.log(
                        `Successfully loaded ${books.length} books from database`
                    );
                } else {
                    console.warn(
                        "No books returned from API or invalid response format"
                    );
                    setBooksData([]);
                    setError(
                        "No books found in the database. Please add some books first."
                    );
                }
            } catch (error) {
                console.error("Failed to load books from database:", error);
                console.error("Error details:", error.message);
                setBooksData([]);
                setError(`Failed to connect to database: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        loadBooks();
    }, []);

    useEffect(() => {
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    // Listen for auth status changes and show welcome message
    useEffect(() => {
        const handleAuthChange = (event) => {
            const { isAuthenticated, user } = event.detail;
            if (isAuthenticated && user) {
                setUser(user);
                setShowWelcome(true);
                setTimeout(() => setShowWelcome(false), 4000);
            } else {
                setUser(null);
                setShowWelcome(false);
            }
        };

        // Check current auth status and if user just logged in
        const authenticated =
            AuthService.isAuthenticated() && AuthService.isSessionValid();
        const currentUser = AuthService.getCurrentUser();
        if (authenticated && currentUser) {
            setUser(currentUser);

            // Check if user just logged in (within last 10 seconds)
            const loginTime = currentUser.loginTime;
            if (loginTime) {
                const timeSinceLogin =
                    new Date().getTime() - new Date(loginTime).getTime();
                if (timeSinceLogin < 10000) {
                    setShowWelcome(true);
                    setTimeout(() => setShowWelcome(false), 4000);
                }
            }
        }

        window.addEventListener("authStatusChanged", handleAuthChange);

        return () => {
            window.removeEventListener("authStatusChanged", handleAuthChange);
        };
    }, []);

    // Filter and sort books
    const filteredAndSortedBooks = useMemo(() => {
        if (searchTerm === "" && selectedCategory === "All") {
            return booksData.sort((a, b) => {
                switch (sortBy) {
                    case "title":
                        return a.title.localeCompare(b.title);
                    case "price-low":
                        return a.price - b.price;
                    case "price-high":
                        return b.price - a.price;
                    case "rating":
                        return b.rating - a.rating;
                    default:
                        return 0;
                }
            });
        }

        let filtered = booksData.filter((book) => {
            const matchesSearch =
                book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.author.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory =
                selectedCategory === "All" ||
                book.category === selectedCategory;
            const matchesPrice =
                book.price >= priceRange[0] && book.price <= priceRange[1];

            return matchesSearch && matchesCategory && matchesPrice;
        });

        // Sort filtered books
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "title":
                    return a.title.localeCompare(b.title);
                case "price-low":
                    return a.price - b.price;
                case "price-high":
                    return b.price - a.price;
                case "rating":
                    return b.rating - a.rating;
                default:
                    return 0;
            }
        });

        return filtered;
    }, [booksData, searchTerm, selectedCategory, sortBy, priceRange]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredAndSortedBooks.length / booksPerPage);
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const currentBooks = filteredAndSortedBooks.slice(startIndex, endIndex);

    // Reset to first page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, sortBy, priceRange]);

    // Cart functions
    const addToCart = (book) => {
        addToCartHandler(book);

        setAddedBook(book);
        setShowAddToCartPopup(true);

        setTimeout(() => {
            setShowAddToCartPopup(false);
            setAddedBook(null);
        }, 5000);

        // Show mini cart notification on mobile (keep existing functionality)
        if (window.innerWidth < 768) {
            setCartView("mini");
            setTimeout(() => setCartView("dropdown"), 2000);
        }
    };

    // Authentication and checkout functions
    const checkAuthAndProceed = () => {
        const isAuthenticated = localStorage.getItem("isAuthenticated");
        const userData = localStorage.getItem("user");

        if (!isAuthenticated || !userData) {
            window.location.href = "/login?redirect=checkout";
        } else {
            window.location.href = "/checkout";
        }
    };

    // Book Detail Modal functions
    const openBookDetail = (book) => {
        setSelectedBook(book);
        setBookDetailQuantity(1);
        setIsBookDetailOpen(true);
        document.body.style.overflow = "hidden"; 
    };

    const closeBookDetail = () => {
        setIsBookDetailOpen(false);
        setSelectedBook(null);
        setBookDetailQuantity(1);
        document.body.style.overflow = "unset"; 
    };

    const addToCartFromDetail = () => {
        if (!selectedBook) return;

        // Add multiple quantities if specified
        for (let i = 0; i < bookDetailQuantity; i++) {
            addToCartHandler(selectedBook);
        }

        // Show add to cart popup
        setAddedBook(selectedBook);
        setShowAddToCartPopup(true);

        // Auto-hide popup after 5 seconds
        setTimeout(() => {
            setShowAddToCartPopup(false);
            setAddedBook(null);
        }, 5000);

        closeBookDetail();
    };

    const buyNowFromDetail = () => {
        if (!selectedBook) return;

        for (let i = 0; i < bookDetailQuantity; i++) {
            addToCartHandler(selectedBook);
        }

        closeBookDetail();
        checkAuthAndProceed();
    };

    const adjustDetailQuantity = (change) => {
        const newQuantity = bookDetailQuantity + change;
        if (newQuantity >= 1 && newQuantity <= (selectedBook?.stock || 1)) {
            setBookDetailQuantity(newQuantity);
        }
    };

    // Pagination functions
    const goToPage = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    };

    // Cart Components
    const CartDropdown = () => (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 z-50 overflow-hidden">
            <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">
                        Shopping Cart
                    </h3>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-white/50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {cart.length === 0 ? (
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">
                        Your cart is empty
                    </p>
                </div>
            ) : (
                <>
                    <div className="max-h-64 overflow-y-auto">
                        {cart.map((item) => (
                            <div
                                key={item.id}
                                className="p-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                            >
                                <div className="flex gap-3">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-12 h-16 object-cover rounded-lg shadow-sm"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm text-gray-900 truncate">
                                            {item.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 truncate">
                                            {item.author}
                                        </p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="font-bold text-amber-600">
                                                ${item.price}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                    className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="text-sm font-semibold w-8 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                    className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-red-400 hover:text-red-600 transition-colors ml-2 p-1 rounded-lg hover:bg-red-50"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 border-t">
                        <div className="flex justify-between items-center mb-3">
                            <span className="font-bold text-gray-900">
                                Total:
                            </span>
                            <span className="font-bold text-xl text-amber-600">
                                ${getTotalPrice().toFixed(2)}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    clearCart();
                                    setIsCartOpen(false);
                                }}
                                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-xl hover:bg-gray-300 transition-colors text-sm font-medium"
                            >
                                Clear Cart
                            </button>
                            <button
                                onClick={checkAuthAndProceed}
                                className="flex-2 bg-green-600 text-white py-2 px-6 rounded-xl hover:bg-green-700 transition-colors font-semibold shadow-lg"
                            >
                                Checkout
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    const CartModal = () => (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200/50 transform animate-in fade-in-0 zoom-in-95 duration-300">
                <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">
                            Shopping Cart
                        </h2>
                        <button
                            onClick={() => setIsCartOpen(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-xl hover:bg-white/50"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {cart.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingCart className="h-10 w-10 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-lg font-medium">
                            Your cart is empty
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="max-h-96 overflow-y-auto p-6">
                            <div className="space-y-4">
                                {cart.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50/50 transition-colors"
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-16 h-20 object-cover rounded-lg shadow-sm"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900">
                                                {item.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm">
                                                {item.author}
                                            </p>
                                            <p className="font-bold text-amber-600 mt-1">
                                                ${item.price}
                                            </p>

                                            <div className="flex items-center gap-3 mt-3">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.id,
                                                                item.quantity -
                                                                    1
                                                            )
                                                        }
                                                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <span className="font-semibold w-12 text-center">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.id,
                                                                item.quantity +
                                                                    1
                                                            )
                                                        }
                                                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <span className="text-sm text-gray-500 font-medium">
                                                    Subtotal: $
                                                    {(
                                                        item.price *
                                                        item.quantity
                                                    ).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() =>
                                                removeFromCart(item.id)
                                            }
                                            className="text-red-400 hover:text-red-600 transition-colors p-2 rounded-xl hover:bg-red-50"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-t">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-lg font-bold text-gray-900">
                                    Total:
                                </span>
                                <span className="text-2xl font-bold text-amber-600">
                                    ${getTotalPrice().toFixed(2)}
                                </span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        clearCart();
                                        setIsCartOpen(false);
                                    }}
                                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                                >
                                    Clear Cart
                                </button>
                                <button
                                    onClick={checkAuthAndProceed}
                                    className="flex-2 bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700 transition-colors font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    const MiniCartNotification = () => (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-bounce backdrop-blur-sm border border-white/20">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold">
                    Item added to cart! ✨
                </span>
            </div>
        </div>
    );

    // Cart Popup (Notification) Component
    const AddToCartPopup = () => {
        if (!showAddToCartPopup || !addedBook) return null;

        return (
            <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full sm:w-80 animate-slide-in-right">
                <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden transform transition-all duration-300 mx-4 sm:mx-0">
                    {/* Header */}
                    <div className="bg-green-600 text-white p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                    <ShoppingCart className="h-3 w-3" />
                                </div>
                                <h3 className="text-sm font-bold">
                                    Added to Cart! ✨
                                </h3>
                            </div>
                            <button
                                onClick={() => {
                                    setShowAddToCartPopup(false);
                                    setAddedBook(null);
                                }}
                                className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="p-4">
                        <div className="flex gap-3 mb-3">
                            <img
                                src={addedBook.image}
                                alt={addedBook.title}
                                className="w-12 h-16 object-cover rounded-lg shadow-sm flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 text-sm leading-tight mb-1 truncate">
                                    {addedBook.title}
                                </h4>
                                <p className="text-gray-600 text-xs mb-1 truncate">
                                    by {addedBook.author}
                                </p>
                                <p className="text-amber-600 font-bold text-sm">
                                    ${addedBook.price}
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3 mb-3 border border-gray-100">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-600 font-medium">
                                    Cart items:
                                </span>
                                <span className="font-bold text-gray-900">
                                    {getTotalItems()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs mt-1">
                                <span className="text-gray-600 font-medium">
                                    Total:
                                </span>
                                <span className="font-bold text-amber-600">
                                    ${getTotalPrice().toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setShowAddToCartPopup(false);
                                    setAddedBook(null);
                                }}
                                className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-xl hover:bg-gray-200 transition-colors text-xs font-semibold"
                            >
                                Continue
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddToCartPopup(false);
                                    setAddedBook(null);
                                    setIsCartOpen(true);
                                    setCartView(
                                        window.innerWidth < 768
                                            ? "modal"
                                            : "dropdown"
                                    );
                                }}
                                className="flex-1 bg-amber-600 text-white py-2 px-3 rounded-xl hover:bg-amber-700 transition-colors text-xs font-semibold shadow-lg"
                            >
                                View Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Book Detail Modal Component
    const BookDetailModal = () => {
        if (!isBookDetailOpen || !selectedBook) return null;

        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-[5px] z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200/50 transform animate-in fade-in-0 zoom-in-95 duration-300 animate-fade-in-up">
                <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-amber-50 to-orange-50">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Book Details
                </h2>
                <button
                    onClick={closeBookDetail}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-xl hover:bg-white/50"
                >
                    <X className="h-6 w-6" />
                </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="space-y-4">
                    <div className="flex items-center justify-center relative group">
                        <img
                        src={selectedBook.image}
                        alt={selectedBook.title}
                        className="wl h-110 sm:h-125 object-cover rounded-2xl shadow-lg transition-transform duration-500 ease-out scale-100 group-hover:scale-105"
                        onError={(e) => {
                            e.target.src =
                            "/api/placeholder/400/600";
                        }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl"></div>

                        {selectedBook.stock < 10 && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                            Low Stock
                        </div>
                        )}
                    </div>

                
                    </div>

                    <div className="space-y-6">
                    <div>
                        <h1 className="text-[25px] font-bold text-gray-900 mb-3 leading-tight">
                        {selectedBook.title}
                        </h1>
                        <div className="flex items-center gap-2 mb-4">
                        <User className="h-5 w-5 text-gray-500" />
                        <p className="text-[16px] text-gray-600 font-medium">
                            by {selectedBook.author}
                        </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-4 w-4 text-amber-600" />
                            <span className="text-sm font-medium text-gray-600">
                            Price
                            </span>
                        </div>
                        <span className="text-2xl font-bold text-amber-600">
                            ${selectedBook.price}
                        </span>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Package className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-600">
                            Stock
                            </span>
                        </div>
                        <span className="text-lg font-bold text-green-600">
                            {selectedBook.stock} available
                        </span>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-600">
                            Category
                            </span>
                        </div>
                        <span className="text-sm font-semibold text-blue-600">
                            {selectedBook.category || "Fiction"}
                        </span>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-gray-600">
                            Published
                            </span>
                        </div>
                        <span className="text-sm font-semibold text-purple-600">
                            {selectedBook.publishedYear ||
                            "2023"}
                        </span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">
                        Description
                        </h3>
                        <p className="text-[15px] text-gray-700 leading-relaxed">
                        {selectedBook.description}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">
                        Quantity
                        </h3>
                        <div className="flex items-center gap-4">
                        <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                            <button
                            onClick={() =>
                                adjustDetailQuantity(-1)
                            }
                            disabled={
                                bookDetailQuantity <= 1
                            }
                            className="p-3 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                            <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-6 py-3 font-bold bg-white min-w-[60px] text-center">
                            {bookDetailQuantity}
                            </span>
                            <button
                            onClick={() =>
                                adjustDetailQuantity(1)
                            }
                            disabled={
                                bookDetailQuantity >=
                                selectedBook.stock
                            }
                            className="p-3 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                            <Plus className="h-4 w-4" />
                            </button>
                        </div>
                        <span className="text-gray-600">
                            Max: {selectedBook.stock}
                        </span>
                        </div>
                    </div>

                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                        <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">
                            Total Price:
                        </span>
                        <span className="text-2xl font-bold text-amber-600">
                            $
                            {(
                            selectedBook.price *
                            bookDetailQuantity
                            ).toFixed(2)}
                        </span>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                        onClick={addToCartFromDetail}
                        disabled={selectedBook.stock === 0}
                        className="flex-1 bg-amber-600 text-white py-3 px-4 rounded-xl hover:bg-amber-700 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                        >
                        <ShoppingCart className="h-5 w-5" />
                        {selectedBook.stock === 0
                            ? "Out of Stock"
                            : "Add to Cart"}
                        </button>
                        <button
                        onClick={buyNowFromDetail}
                        disabled={selectedBook.stock === 0}
                        className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                        >
                        <Check className="h-5 w-5" />
                        Buy Now
                        </button>
                    </div>
                    </div>
                </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in-up {
                0% {
                    opacity: 0;
                    transform: translateY(40px) scale(0.98);
                }
                100% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                }
                .animate-fade-in-up {
                animation: fade-in-up 0.4s cubic-bezier(0.4,0,0.2,1);
                }
            `}</style>
            
            </div>
        );
    };

    // Pagination Component
    const Pagination = () => {
        if (totalPages <= 1) return null;

        const getPageNumbers = () => {
            const pages = [];
            const showEllipsis = totalPages > 7;

            if (!showEllipsis) {
                for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                if (currentPage <= 4) {
                    for (let i = 1; i <= 5; i++) {
                        pages.push(i);
                    }
                    pages.push("...");
                    pages.push(totalPages);
                } else if (currentPage >= totalPages - 3) {
                    pages.push(1);
                    pages.push("...");
                    for (let i = totalPages - 4; i <= totalPages; i++) {
                        pages.push(i);
                    }
                } else {
                    pages.push(1);
                    pages.push("...");
                    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                        pages.push(i);
                    }
                    pages.push("...");
                    pages.push(totalPages);
                }
            }
            return pages;
        };

        return (
            <div className="flex items-center justify-center mt-12 gap-3">
                <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-300"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </button>

                <div className="flex gap-2">
                    {getPageNumbers().map((page, index) => (
                        <button
                            key={index}
                            onClick={() => page !== "..." && goToPage(page)}
                            disabled={page === "..."}
                            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
                                page === currentPage
                                    ? "bg-amber-600 text-white shadow-lg"
                                    : page === "..."
                                    ? "text-gray-400 cursor-default"
                                    : "text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white hover:shadow-md"
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-300"
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-amber-50">
            {/* Welcome notification for books page */}
            {showWelcome && user && (
                <div className="fixed top-20 right-4 bg-blue-500 text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-bounce backdrop-blur-sm border border-white/20">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <ShoppingCart className="h-4 w-4" />
                        </div>
                        <span className="font-semibold">
                            Welcome back, {user.name || user.email}! 📚
                        </span>
                    </div>
                </div>
            )}

            <div className="bg-white/80 backdrop-blur-lg shadow-xl border-b border-gray-200/50 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                        {/* Search Bar */}
                        <div className="relative flex-1 max-w-2xl group">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5 group-focus-within:text-amber-600 transition-colors z-10 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search books by title or author..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-[16px] bg-white backdrop-blur-sm transition-all duration-300 hover:bg-gray-50 focus:bg-white shadow-sm"
                            />
                        </div>

                        <div className="hidden sm:block relative">
                            <button
                                onClick={() => {
                                    setIsCartOpen(!isCartOpen);
                                    setCartView("dropdown");
                                }}
                                className="relative bg-amber-600 text-white px-6 py-3 rounded-2xl hover:bg-amber-700 transition-all duration-300 flex items-center gap-2 font-semibold whitespace-nowrap shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                <ShoppingCart className="h-5 w-5" />
                                Cart ({getTotalItems()})
                                {getTotalItems() > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse shadow-lg">
                                        {getTotalItems()}
                                    </span>
                                )}
                            </button>
                            {isCartOpen && cartView === "dropdown" && (
                                <CartDropdown />
                            )}
                        </div>

                        {/* Mobile Cart */}
                        <button
                            onClick={() => {
                                setIsCartOpen(true);
                                setCartView("modal");
                            }}
                            className="sm:hidden relative bg-amber-600 text-white px-5 py-3 rounded-2xl hover:bg-amber-700 transition-all duration-300 shadow-lg"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {getTotalItems() > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                                    {getTotalItems()}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Mobile Filter Toggle */}
                    <div className="md:hidden py-4">
                        <button
                            onClick={() =>
                                setIsMobileFiltersOpen(!isMobileFiltersOpen)
                            }
                            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-200 shadow-sm w-full justify-center hover:bg-white transition-all duration-300 hover:shadow-md"
                        >
                            <Filter className="h-4 w-4 text-amber-600" />
                            <span className="font-medium text-gray-700">
                                Filters & Sort
                            </span>
                            <ChevronDown
                                className={`h-4 w-4 transition-transform duration-300 ${
                                    isMobileFiltersOpen ? "rotate-180" : ""
                                }`}
                            />
                        </button>
                    </div>

                    <div
                        className={`${
                            isMobileFiltersOpen ? "block" : "hidden"
                        } md:block py-6`}
                    >
                        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                                    <Filter className="h-4 w-4 text-white" />
                                </div>
                                <span className="font-semibold text-gray-800">
                                    Filters:
                                </span>
                            </div>

                            <div className="flex gap-3 flex-wrap">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() =>
                                            setSelectedCategory(category)
                                        }
                                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                                            selectedCategory === category
                                                ? "bg-amber-600 text-white shadow-lg"
                                                : "bg-white/80 text-gray-700 hover:bg-white border border-gray-200 shadow-sm hover:shadow-md"
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none bg-white/80 backdrop-blur-sm font-medium text-gray-700 shadow-sm hover:shadow-md transition-all duration-300"
                                >
                                    {sortOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                            Discover Amazing Books
                        </h2>
                        <p className="text-gray-600 font-medium">
                            {filteredAndSortedBooks.length} books available
                        </p>
                    </div>
                    {filteredAndSortedBooks.length > 0 && (
                        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                            <div className="text-sm text-gray-600 font-semibold">
                                Showing {startIndex + 1}-
                                {Math.min(
                                    endIndex,
                                    filteredAndSortedBooks.length
                                )}{" "}
                                of {filteredAndSortedBooks.length} books
                            </div>
                        </div>
                    )}
                </div>

                {/* Books Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="relative">
                                <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 mx-auto mb-6"></div>
                                <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                            </div>
                            <p className="text-gray-600 text-lg font-medium">
                                Loading amazing books for you...
                            </p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-red-200 max-w-md mx-auto">
                            <div className="text-red-400 mb-6">
                                <X className="h-20 w-20 mx-auto" />
                            </div>
                            <p className="text-red-600 text-xl font-bold mb-2">
                                Connection Error
                            </p>
                            <p className="text-gray-600 mb-6">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-amber-600 text-white px-6 py-3 rounded-xl hover:bg-amber-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                ) : booksData.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200 max-w-md mx-auto">
                            <div className="text-gray-400 mb-6">
                                <Search className="h-20 w-20 mx-auto" />
                            </div>
                            <p className="text-gray-700 text-xl font-bold mb-2">
                                No Books Available
                            </p>
                            <p className="text-gray-500">
                                The library is empty. Please add some books to
                                get started.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-4 sm:gap-6">
                        {currentBooks.map((book, index) => (
                            <div
                                key={book.id}
                                className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-300 overflow-hidden flex flex-col cursor-pointer"
                                onClick={() => openBookDetail(book)}
                            >
                                <div className="relative overflow-hidden">
                                    <img
                                        src={book.image}
                                        alt={book.title}
                                        className="w-full h-64 sm:h-72 object-cover transition-opacity duration-300 group-hover:opacity-95"
                                        onError={(e) => {
                                            e.target.src =
                                                "/api/placeholder/200/300";
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/20">
                                        <button className="bg-white/95 backdrop-blur-sm text-gray-800 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
                                            <Eye className="h-4 w-4" />
                                            View More
                                        </button>
                                    </div>

                                    {book.stock < 10 && (
                                        <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                                            Low Stock
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="font-bold text-base text-gray-900 mb-1 line-clamp-2 leading-tight group-hover:text-amber-600 transition-colors duration-300">
                                        {book.title}
                                    </h3>
                                    <p className="text-gray-600 text-xs mb-2 font-medium">
                                        by {book.author}
                                    </p>
                                    <p className="text-gray-700 text-xs mb-3 line-clamp-2 leading-relaxed flex-grow">
                                        {book.description}
                                    </p>

                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-lg font-bold text-amber-600">
                                            ${book.price}
                                        </span>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                            {book.stock} left
                                        </span>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); 
                                            addToCart(book);
                                        }}
                                        disabled={book.stock === 0}
                                        className="w-full bg-amber-600 text-white py-2.5 px-3 rounded-xl hover:bg-amber-700 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none text-sm mt-auto"
                                    >
                                        <ShoppingCart className="h-3.5 w-3.5" />
                                        {book.stock === 0
                                            ? "Out of Stock"
                                            : "Add to Cart"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* No Search Results - only show if we have books but none match the filter */}
                {!loading &&
                    !error &&
                    booksData.length > 0 &&
                    filteredAndSortedBooks.length === 0 && (
                        <div className="text-center py-20">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200 max-w-md mx-auto">
                                <div className="text-gray-400 mb-6">
                                    <Search className="h-20 w-20 mx-auto" />
                                </div>
                                <p className="text-gray-700 text-xl font-bold mb-2">
                                    No matches found
                                </p>
                                <p className="text-gray-500">
                                    Try adjusting your search terms or filters
                                </p>
                            </div>
                        </div>
                    )}

                {/* Pagination */}
                {filteredAndSortedBooks.length > 0 && <Pagination />}
            </div>

            {/* Cart Modal for Mobile */}
            {isCartOpen && cartView === "modal" && <CartModal />}

            {/* Mini Cart Notification */}
            {cartView === "mini" && <MiniCartNotification />}

            {/* Add to Cart Popup */}
            <AddToCartPopup />

            {/* Book Detail Modal */}
            {isBookDetailOpen && selectedBook && <BookDetailModal />}
        </div>
    );
}
