import { useState, useEffect } from "react";
import {
    MessageSquare,
    Star,
    User,
    Calendar,
    Trash2,
    Search,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import apiService from "../../../utils/api";

export default function AdminFeedbacks() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [feedbackToDelete, setFeedbackToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();

    const feedbacksPerPage = 10;

    useEffect(() => {
        // Check if user is admin
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user.roles || !user.roles.includes("ROLE_ADMIN")) {
            navigate("/login");
            return;
        }

        fetchAllFeedbacks();
    }, [navigate]);

    useEffect(() => {
        filterFeedbacks();
    }, [feedbacks, searchTerm]);

    const fetchAllFeedbacks = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log("Loading feedbacks...");
            const response = await apiService.getAllFeedbacksAdmin(0, 100);
            console.log("Feedbacks response:", response);

            setFeedbacks(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Failed to fetch feedbacks:", error);
            setError("Failed to load feedbacks. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const filterFeedbacks = () => {
        let filtered = feedbacks.filter((feedback) => {
            const customerName = feedback.customerName || "";
            const comment = feedback.comment || "";
            const bookTitle = feedback.book?.title || "";

            return (
                customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                bookTitle.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });

        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setFilteredFeedbacks(filtered);
        setCurrentPage(1); 
    };

    const handleDeleteClick = (feedback) => {
        setFeedbackToDelete(feedback);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!feedbackToDelete) return;

        setIsDeleting(true);
        setError(null);

        try {
            await apiService.deleteFeedback(feedbackToDelete.id);

            // Close modal and reset state immediately after successful deletion
            setShowDeleteModal(false);
            setFeedbackToDelete(null);
            setIsDeleting(false);

            // Refresh feedback list
            fetchAllFeedbacks();
        } catch (error) {
            console.error("Failed to delete feedback:", error);
            setError("Failed to delete feedback. Please try again.");
            setIsDeleting(false);
        }
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
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Pagination calculations
    const totalPages = Math.ceil(filteredFeedbacks.length / feedbacksPerPage);
    const startIndex = (currentPage - 1) * feedbacksPerPage;
    const endIndex = startIndex + feedbacksPerPage;
    const currentFeedbacks = filteredFeedbacks.slice(startIndex, endIndex);

    const goToPage = (page) => {
        setCurrentPage(page);
    };

    const DeleteModal = () => (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[4px] flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Delete Feedback
                        </h3>
                        <p className="text-sm text-gray-600">
                            This action cannot be undone
                        </p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6 mx-6">
                    <p className="text-sm text-gray-600 mb-2">
                        You are about to delete this feedback:
                    </p>
                    <p className="font-semibold text-gray-900">
                        From: {feedbackToDelete?.customerName}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                        "{feedbackToDelete?.comment?.substring(0, 100)}
                        {feedbackToDelete?.comment?.length > 100 ? "..." : ""}"
                    </p>
                    {feedbackToDelete?.book && (
                        <p className="text-sm text-gray-600 mt-1">
                            Book: {feedbackToDelete.book.title}
                        </p>
                    )}
                </div>

                <div className="flex gap-3 p-6">
                    <button
                        onClick={() => setShowDeleteModal(false)}
                        disabled={isDeleting}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDeleteConfirm}
                        disabled={isDeleting}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isDeleting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );

    const FeedbackCard = ({ feedback, showActions = true }) => (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">
                            {feedback.customerName}
                        </p>
                        <p className="text-sm text-gray-500">
                            {feedback.user?.email}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                            feedback.isApproved
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                        }`}
                    >
                        {feedback.isApproved ? "Approved" : "Pending"}
                    </span>
                    <span
                        className={`px-2 py-1 rounded-full text-xs ${
                            feedback.feedbackType === "service"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                        }`}
                    >
                        {feedback.feedbackType === "service"
                            ? "Service"
                            : "Book"}
                    </span>
                </div>
            </div>

            <div className="flex items-center space-x-2 mb-3">
                <div className="flex items-center space-x-1">
                    {renderStars(feedback.rating)}
                </div>
                <span className="text-sm text-gray-600">
                    ({feedback.rating}/5)
                </span>
            </div>

            <div className="mb-4">
                <p className="text-gray-700 leading-relaxed">
                    "{feedback.comment}"
                </p>
            </div>

            {/* Book Reference (if applicable) */}
            {feedback.book && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">Book Review:</p>
                    <p className="font-medium text-gray-900">
                        {feedback.book.title}
                    </p>
                    <p className="text-sm text-gray-600">
                        by {feedback.book.author}
                    </p>
                </div>
            )}

            <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-3">
                <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(feedback.createdAt)}
                </div>

                {showActions && (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleDeleteClick(feedback)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Delete Feedback"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                        <span className="ml-3 text-gray-600">
                            Loading feedbacks...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Feedback Management
                            </h1>
                            <p className="text-gray-600">
                                Manage customer feedbacks and reviews
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8 py-4">
                        <Link
                            to="/admin/books"
                            className="text-gray-500 hover:text-gray-700 pb-1 font-medium transition-colors"
                        >
                            Books
                        </Link>
                        <Link
                            to="/admin/users"
                            className="text-gray-500 hover:text-gray-700 pb-1 font-medium transition-colors"
                        >
                            Users
                        </Link>
                        <Link
                            to="/admin/orders"
                            className="text-gray-500 hover:text-gray-700 pb-1 font-medium transition-colors"
                        >
                            Orders
                        </Link>
                        <Link
                            to="/admin/feedbacks"
                            className="text-amber-600 border-b-2 border-amber-600 pb-1 font-medium"
                        >
                            Feedbacks
                        </Link>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Error loading feedbacks
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{error}</p>
                                </div>
                                <div className="mt-4">
                                    <button
                                        onClick={fetchAllFeedbacks}
                                        className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content only shows when not loading and no error */}
                {!loading && !error && (
                    <>
                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <MessageSquare className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">
                                            Total Feedbacks
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {feedbacks.length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search and Filters */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <input
                                            type="text"
                                            placeholder="Search feedbacks by customer name, comment, or book title..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feedback List */}
                        <div className="space-y-6">
                            {currentFeedbacks.length > 0 ? (
                                currentFeedbacks.map((feedback) => (
                                    <FeedbackCard
                                        key={feedback.id}
                                        feedback={feedback}
                                    />
                                ))
                            ) : filteredFeedbacks.length === 0 &&
                              feedbacks.length > 0 ? (
                                <div className="text-center py-12">
                                    <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                        No matching feedbacks found
                                    </h3>
                                    <p className="text-gray-500">
                                        Try adjusting your search terms.
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                        No feedbacks yet
                                    </h3>
                                    <p className="text-gray-500">
                                        Customer feedbacks will appear here once
                                        submitted.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 mt-8 rounded-lg shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 flex justify-between sm:hidden">
                                        <button
                                            onClick={() =>
                                                goToPage(currentPage - 1)
                                            }
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() =>
                                                goToPage(currentPage + 1)
                                            }
                                            disabled={
                                                currentPage === totalPages
                                            }
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                Showing{" "}
                                                <span className="font-medium">
                                                    {startIndex + 1}
                                                </span>{" "}
                                                to{" "}
                                                <span className="font-medium">
                                                    {Math.min(
                                                        endIndex,
                                                        filteredFeedbacks.length
                                                    )}
                                                </span>{" "}
                                                of{" "}
                                                <span className="font-medium">
                                                    {filteredFeedbacks.length}
                                                </span>{" "}
                                                results
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                                <button
                                                    onClick={() =>
                                                        goToPage(
                                                            currentPage - 1
                                                        )
                                                    }
                                                    disabled={currentPage === 1}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Previous
                                                </button>
                                                {[...Array(totalPages)].map(
                                                    (_, index) => (
                                                        <button
                                                            key={index + 1}
                                                            onClick={() =>
                                                                goToPage(
                                                                    index + 1
                                                                )
                                                            }
                                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                                currentPage ===
                                                                index + 1
                                                                    ? "z-10 bg-amber-50 border-amber-500 text-amber-600"
                                                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                                            }`}
                                                        >
                                                            {index + 1}
                                                        </button>
                                                    )
                                                )}
                                                <button
                                                    onClick={() =>
                                                        goToPage(
                                                            currentPage + 1
                                                        )
                                                    }
                                                    disabled={
                                                        currentPage ===
                                                        totalPages
                                                    }
                                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Next
                                                </button>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Delete Modal */}
            {showDeleteModal && <DeleteModal />}
        </div>
    );
}
