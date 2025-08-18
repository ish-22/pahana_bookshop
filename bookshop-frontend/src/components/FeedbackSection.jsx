import { useState, useEffect } from "react";
import { Star, MessageSquare, User, Calendar, Quote } from "lucide-react";
import { AuthService } from "../utils/auth";
import apiService from "../utils/api";

export const FeedbackSection = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddFeedback, setShowAddFeedback] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        fetchFeedbacks();
        setIsAuthenticated(AuthService.isAuthenticated());
    }, []);

    const fetchFeedbacks = async (page = 0, append = false) => {
        try {
            if (!append) setLoading(true);
            else setLoadingMore(true);

            // Get 6 feedbacks per page
            const response = await apiService.getPublicFeedbacks(page, 6);
            const newFeedbacks = response || [];

            if (append) {
                setFeedbacks((prev) => [...prev, ...newFeedbacks]);
            } else {
                setFeedbacks(newFeedbacks);
            }

            // Check if there are more feedbacks to load
            setHasMore(newFeedbacks.length === 6);
            setCurrentPage(page);
        } catch (error) {
            console.error("Failed to fetch feedbacks:", error);
        } finally {
            if (!append) setLoading(false);
            else setLoadingMore(false);
        }
    };

    const handleAddFeedbackClick = () => {
        if (!isAuthenticated) {
            // Redirect to login, will default to home page after login
            window.location.href = "/login";
        } else {
            setShowAddFeedback(true);
        }
    };

    const handleViewMore = () => {
        fetchFeedbacks(currentPage + 1, true);
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <Star
                key={index}
                className={`w-4 h-4 ${
                    index < rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                }`}
            />
        ));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
                <div className="container mx-auto px-6">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">
                            Loading feedbacks...
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        // Feedback Section
        <>
            <section className="py-16 bg-amber-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center mb-4">
                            <MessageSquare className="w-8 h-8 text-amber-800 mr-3 mt-2 font-bold" />
                            <h2 className="text-4xl font-bold bg-gradient-to-br from-amber-600 to-amber-800 bg-clip-text text-transparent">
                                Customer Feedbacks
                            </h2>
                        </div>
                        <p className="text-xl mt-10 text-gray-600 max-w-2xl mx-auto">
                            See what our customers are saying about our books
                            and services
                        </p>

                        <div className="mt-8">
                            <button
                                onClick={handleAddFeedbackClick}
                                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-800 text-basecolor font-semibold rounded-xl hover:from-amber-900 hover:to-amber-900 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                <MessageSquare className="w-5 h-5 mr-2" />
                                Add Your Feedback
                            </button>
                        </div>
                    </div>

                    {feedbacks.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {feedbacks.map((feedback) => (
                                <div
                                    key={feedback.id}
                                    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 p-8 border border-gray-300 overflow-hidden"
                                >
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full shadow-lg">
                                                <Quote className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex items-center space-x-1 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-md border border-amber-200/50">
                                                {renderStars(feedback.rating)}
                                            </div>
                                        </div>

                                        <div className="mb-8">
                                            <p className="text-amber-900 leading-relaxed text-lg font-medium relative">
                                                <span className="text-amber-700 text-2xl font-serif">
                                                    "
                                                </span>
                                                {feedback.comment}
                                                <span className="text-amber-700 text-2xl font-serif">
                                                    "
                                                </span>
                                            </p>
                                        </div>

                                        <div className="border-t border-amber-200/70 pt-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="relative">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-amber-600 via-amber-700 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                                                            <User className="w-6 h-6 text-white" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <p className="font-bold text-amber-900 text-lg">
                                                            {
                                                                feedback.customerName
                                                            }
                                                        </p>
                                                        <div className="flex items-center text-sm text-gray-600  py-1 rounded-full ">
                                                            <Calendar className="w-3 h-3 mr-1" />
                                                            {formatDate(
                                                                feedback.createdAt
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <span
                                                    className={`px-4 py-2 rounded-full text-sm font-bold shadow-md transform group-hover:scale-105 transition-transform duration-200 ${
                                                        feedback.feedbackType ===
                                                        "service"
                                                            ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white"
                                                            : "bg-gradient-to-r from-blue-600 to-indigo-700 text-white"
                                                    }`}
                                                >
                                                    {feedback.feedbackType ===
                                                    "service"
                                                        ? "Service"
                                                        : "Book"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-3xl opacity-60"></div>
                            <div className="border absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-amber-100/30 to-transparent rounded-full blur-3xl"></div>
                            <div className="border absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-orange-100/30 to-transparent rounded-full blur-2xl"></div>

                            <div className="relative z-10 text-center py-20 px-8">
                                <div className="relative inline-block mb-8">
                                    <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-xl mx-auto">
                                        <MessageSquare className="w-12 h-12 text-white" />
                                    </div>
                                    <div className="absolute inset-0 w-24 h-24 border-4 border-amber-300/30 rounded-full animate-pulse"></div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <h3 className="text-3xl font-bold text-gray-800 mb-4">
                                        No feedbacks yet
                                    </h3>
                                    <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
                                        Be the first to share your experience
                                        and help others discover what makes our
                                        bookshop special!
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                    <button
                                        onClick={handleAddFeedbackClick}
                                        className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold rounded-full hover:from-amber-700 hover:to-amber-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        <MessageSquare className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                                        Share Your Experience
                                        <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            ✨
                                        </div>
                                    </button>

                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <div className="flex -space-x-2">
                                            <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full border-2 border-white"></div>
                                            <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full border-2 border-white"></div>
                                            <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full border-2 border-white"></div>
                                        </div>
                                        <span>Join our community</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {hasMore && feedbacks.length > 0 && (
                        <div className="text-center mt-12">
                            <button
                                onClick={handleViewMore}
                                disabled={loadingMore}
                                className="px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-800 text-basecolor  hover:from-amber-900 hover:to-amber-900 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold rounded-lg hover:bg-amber-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loadingMore
                                    ? "Loading..."
                                    : "View More Feedbacks"}
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {showAddFeedback && (
                <AddFeedbackModal
                    onClose={() => setShowAddFeedback(false)}
                    onSuccess={() => {
                        setShowAddFeedback(false);
                        fetchFeedbacks();
                    }}
                />
            )}
        </>
    );
};

// Add Feedback Modal Component
const AddFeedbackModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        customerName: "",
        comment: "",
        rating: 5,
        feedbackType: "service",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        // Pre-fill customer name from current user
        const user = AuthService.getCurrentUser();
        if (user) {
            setFormData((prev) => ({ ...prev, customerName: user.name || "" }));
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!formData.customerName.trim()) {
            newErrors.customerName = "Name is required";
        }
        if (!formData.comment.trim() || formData.comment.trim().length < 10) {
            newErrors.comment = "Comment must be at least 10 characters";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setLoading(true);
            await apiService.createFeedback(formData);
            onSuccess();
        } catch (error) {
            console.error("Failed to submit feedback:", error);
            setErrors({ submit: error.message || "Failed to submit feedback" });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "rating" ? parseInt(value) : value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    return (
        // Modal for Adding Feedback
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[6px] flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900">
                            Add Your Feedback
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-black text-4xl font-semibold"
                        >
                            ×
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Your Name *
                            </label>
                            <input
                                type="text"
                                name="customerName"
                                value={formData.customerName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-700/80"
                                placeholder="Enter your name"
                            />
                            {errors.customerName && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.customerName}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Feedback Type *
                            </label>
                            <select
                                name="feedbackType"
                                value={formData.feedbackType}
                                onChange={handleChange}
                                className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-700/80"
                            >
                                <option value="service">Website Service</option>
                                <option value="book">Book Review</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Rating *
                            </label>
                            <select
                                name="rating"
                                value={formData.rating}
                                onChange={handleChange}
                                className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-700/80"
                            >
                                <option value={5}>5 Stars - Excellent</option>
                                <option value={4}>4 Stars - Very Good</option>
                                <option value={3}>3 Stars - Good</option>
                                <option value={2}>2 Stars - Fair</option>
                                <option value={1}>1 Star - Poor</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Your Feedback *
                            </label>
                            <textarea
                                name="comment"
                                value={formData.comment}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-700/80"
                                placeholder="Share your experience with us..."
                            />
                            {errors.comment && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.comment}
                                </p>
                            )}
                        </div>

                        {errors.submit && (
                            <div className="text-red-500 text-sm">
                                {errors.submit}
                            </div>
                        )}

                        <div className="flex space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 disabled:opacity-50"
                            >
                                {loading ? "Submitting..." : "Submit Feedback"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
