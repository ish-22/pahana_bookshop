import React, { useState, useEffect } from "react";
import {
    ArrowLeft,
    Edit,
    Trash2,
    BookOpen,
    User,
    Calendar,
    DollarSign,
    Package,
    Tag,
    AlertCircle,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../../utils/api";

export default function AdminBookDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        // Check if user is admin
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user.roles || !user.roles.includes("ROLE_ADMIN")) {
            navigate("/login");
            return;
        }

        loadBook();
    }, [id, navigate]);

    const loadBook = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/books/${id}`);
            setBook(response);
        } catch (error) {
            console.error("Error loading book:", error);
            setError("Failed to load book details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            await api.delete(`/admin/books/${id}`);
            navigate("/admin/books");
        } catch (error) {
            console.error("Error deleting book:", error);
            setError("Failed to delete book. Please try again.");
            setIsDeleting(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const DeleteModal = () => (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[6px] z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full mx-4 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Delete Book
                        </h3>
                        <p className="text-sm text-gray-600">
                            This action cannot be undone
                        </p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-600 mb-2">
                        You are about to delete:
                    </p>
                    <p className="font-semibold text-gray-900 truncate">
                        {book?.title}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                        by {book?.author}
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowDeleteModal(false)}
                        disabled={isDeleting}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 text-sm sm:text-base"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDeleteConfirm}
                        disabled={isDeleting}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                        {isDeleting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span className="hidden xs:inline">
                                    Deleting...
                                </span>
                                <span className="xs:hidden">...</span>
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                        <span className="ml-3 text-gray-600 text-sm sm:text-base">
                            Loading book details...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                            <p className="text-red-600 font-medium">Error</p>
                        </div>
                        <p className="text-red-600 text-sm mt-1">{error}</p>
                        <div className="mt-4">
                            <button
                                onClick={loadBook}
                                className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Book not found
                        </h3>
                        <p className="text-gray-500 mb-6 text-sm sm:text-base px-4">
                            The book you're looking for doesn't exist or may
                            have been deleted.
                        </p>
                        <Link
                            to="/admin/books"
                            className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-amber-700 transition-colors font-medium text-sm sm:text-base"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Books
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="block sm:hidden py-4">
                        <Link
                            to="/admin/books"
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Back to Books
                        </Link>
                        <div className="mb-4">
                            <h1 className="text-xl font-bold text-gray-900">
                                Book Details
                            </h1>
                            <p className="text-sm text-gray-600">
                                View and manage book information
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Link
                                to={`/admin/books/${book.id}/edit`}
                                className="flex-1 bg-amber-600 text-white px-3 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                            >
                                <Edit className="h-4 w-4" />
                                <span className="hidden xs:inline">
                                    Edit Book
                                </span>
                                <span className="xs:hidden">Edit</span>
                            </Link>
                            <button
                                onClick={handleDeleteClick}
                                className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="hidden xs:inline">Delete</span>
                                <span className="xs:hidden">Del</span>
                            </button>
                        </div>
                    </div>

                    <div className="hidden sm:flex items-center justify-between py-6">
                        <div className="flex items-center gap-4">
                            <Link
                                to="/admin/books"
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                Back to Books
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Book Details
                                </h1>
                                <p className="text-gray-600">
                                    View and manage book information
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                to={`/admin/books/${book.id}/edit`}
                                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 font-medium"
                            >
                                <Edit className="h-4 w-4" />
                                Edit Book
                            </Link>
                            <button
                                onClick={handleDeleteClick}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                            <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-4">
                                <img
                                    src={book.image}
                                    alt={book.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src =
                                            "/api/placeholder/300/400";
                                    }}
                                />
                            </div>
                            <div className="flex items-center justify-center">
                                <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        book.stock === 0
                                            ? "bg-red-100 text-red-800"
                                            : book.stock < 10
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-green-100 text-green-800"
                                    }`}
                                >
                                    <Package className="h-4 w-4 mr-1" />
                                    <span className="hidden xs:inline">
                                        {book.stock} units in stock
                                    </span>
                                    <span className="xs:hidden">
                                        {book.stock} units
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                            <div className="mb-4 sm:mb-6">
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                    {book.title}
                                </h2>
                                <div className="flex items-center gap-2 text-gray-600 mb-4">
                                    <User className="h-4 w-4" />
                                    <span className="text-sm sm:text-base">
                                        by {book.author}
                                    </span>
                                </div>
                                <div className="flex flex-col xs:flex-row xs:items-center gap-3 xs:gap-4 mb-4 sm:mb-6">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-green-600" />
                                        <span className="text-xl sm:text-2xl font-bold text-green-600">
                                            {formatCurrency(book.price)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-gray-500" />
                                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                                            {book.category}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4 sm:mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    Description
                                </h3>
                                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                                    {book.description}
                                </p>
                            </div>

                            <div className="border-t pt-4 sm:pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Book Information
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <BookOpen className="h-5 w-5 text-gray-500 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-gray-600">
                                                Book ID
                                            </p>
                                            <p className="font-medium text-gray-900 truncate">
                                                {book.id}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Package className="h-5 w-5 text-gray-500 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-gray-600">
                                                Stock Quantity
                                            </p>
                                            <p className="font-medium text-gray-900">
                                                {book.stock} units
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Calendar className="h-5 w-5 text-gray-500 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-gray-600">
                                                Date Added
                                            </p>
                                            <p className="font-medium text-gray-900 text-sm sm:text-base">
                                                {formatDate(book.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Calendar className="h-5 w-5 text-gray-500 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-gray-600">
                                                Last Updated
                                            </p>
                                            <p className="font-medium text-gray-900 text-sm sm:text-base">
                                                {formatDate(
                                                    book.updatedAt ||
                                                        book.createdAt
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            {showDeleteModal && <DeleteModal />}
        </div>
    );
}
