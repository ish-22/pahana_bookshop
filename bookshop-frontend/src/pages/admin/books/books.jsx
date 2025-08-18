import React, { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    BookOpen,
    Package,
    AlertCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../utils/api";

export default function AdminBooks() {
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortBy, setSortBy] = useState("title");
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [bookToDelete, setBookToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const booksPerPage = 10;

    const categories = [
        "All",
        "Classic",
        "Dystopian",
        "Romance",
        "Fantasy",
        "Horror",
        "Gothic",
        "Adventure",
        "Epic",
        "Philosophical",
        "Historical",
        "Modern Classic",
    ];

    // Check if user is admin
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user.roles || !user.roles.includes("ROLE_ADMIN")) {
            navigate("/login");
            return;
        }

        loadBooks();
    }, [navigate]);

    useEffect(() => {
        filterAndSortBooks();
    }, [books, searchTerm, selectedCategory, sortBy]);

    const loadBooks = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log("Loading books...");
            console.log("User token:", localStorage.getItem("token"));

            const response = await api.get("/books");
            console.log("Books response:", response);

            setBooks(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Error loading books:", error);
            setError("Failed to load books. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortBooks = () => {
        let filtered = books.filter((book) => {
            const matchesSearch =
                book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.isbn?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory =
                selectedCategory === "All" ||
                book.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });

        // Sort books
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "title":
                    return a.title.localeCompare(b.title);
                case "author":
                    return a.author.localeCompare(b.author);
                case "price-low":
                    return a.price - b.price;
                case "price-high":
                    return b.price - a.price;
                case "stock-low":
                    return a.stock - b.stock;
                case "stock-high":
                    return b.stock - a.stock;
                case "newest":
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case "oldest":
                    return new Date(a.createdAt) - new Date(b.createdAt);
                default:
                    return 0;
            }
        });

        setFilteredBooks(filtered);
        setCurrentPage(1);
    };

    const handleDeleteClick = (book) => {
        setBookToDelete(book);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!bookToDelete) return;

        setIsDeleting(true);
        setError(null); 

        try {
            await api.delete(`/admin/books/${bookToDelete.id}`);

            setShowDeleteModal(false);
            setBookToDelete(null);
            setIsDeleting(false);

            await loadBooks();
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
            month: "short",
            day: "numeric",
        });
    };

    // Pagination
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const currentBooks = filteredBooks.slice(startIndex, endIndex);

    const goToPage = (page) => {
        setCurrentPage(page);
    };

    // Delete Modal, This is used to confirm book deletion
    const DeleteModal = () => (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[6px] z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
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
                    <p className="font-semibold text-gray-900">
                        {bookToDelete?.title}
                    </p>
                    <p className="text-sm text-gray-600">
                        by {bookToDelete?.author}
                    </p>
                </div>

                <div className="flex gap-3">
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

    // Main component render
    return (
        <div className="min-h-screen bg-gray-200">
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Books Management
                            </h1>
                            <p className="text-gray-600">
                                Manage your book inventory
                            </p>
                        </div>
                        <Link
                            to="/admin/books/add"
                            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 font-medium"
                        >
                            <Plus className="h-4 w-4" />
                            Add New Book
                        </Link>
                    </div>
                </div>
            </div>

            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8 py-4">
                        <Link
                            to="/admin/books"
                            className="text-amber-600 border-b-2 border-amber-600 pb-1 font-medium"
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
                            className="text-gray-500 hover:text-gray-700 pb-1 font-medium transition-colors"
                        >
                            Feedbacks
                        </Link>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                        <span className="ml-3 text-gray-600">
                            Loading books...
                        </span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Error loading books
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{error}</p>
                                </div>
                                <div className="mt-4">
                                    <button
                                        onClick={loadBooks}
                                        className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <BookOpen className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">
                                            Total Books
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {books.length}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Package className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">
                                            In Stock
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {
                                                books.filter(
                                                    (book) => book.stock > 0
                                                ).length
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <AlertCircle className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">
                                            Low Stock
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {
                                                books.filter(
                                                    (book) =>
                                                        book.stock > 0 &&
                                                        book.stock < 10
                                                ).length
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                            <div className="flex flex-col lg:flex-row gap-4">
                                {/* Search */}
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                        <input
                                            type="text"
                                            placeholder="Search books by title, author, or ISBN..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) =>
                                            setSelectedCategory(e.target.value)
                                        }
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                                    >
                                        {categories.map((category) => (
                                            <option
                                                key={category}
                                                value={category}
                                            >
                                                {category}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        value={sortBy}
                                        onChange={(e) =>
                                            setSortBy(e.target.value)
                                        }
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                                    >
                                        <option value="title">Title A-Z</option>
                                        <option value="author">
                                            Author A-Z
                                        </option>
                                        <option value="price-low">
                                            Price: Low to High
                                        </option>
                                        <option value="price-high">
                                            Price: High to Low
                                        </option>
                                        <option value="stock-low">
                                            Stock: Low to High
                                        </option>
                                        <option value="stock-high">
                                            Stock: High to Low
                                        </option>
                                        <option value="newest">
                                            Newest First
                                        </option>
                                        <option value="oldest">
                                            Oldest First
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                                <span>
                                    Showing {startIndex + 1}-
                                    {Math.min(endIndex, filteredBooks.length)}{" "}
                                    of {filteredBooks.length} books
                                </span>
                            </div>
                        </div>

                        {/* Books Table */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Book
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Price
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Stock
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Added
                                            </th>
                                            <th className="relative px-6 py-3">
                                                <span className="sr-only">
                                                    Actions
                                                </span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentBooks.map((book) => (
                                            <tr
                                                key={book.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <img
                                                            className="h-16 w-12 object-cover rounded"
                                                            src={book.image}
                                                            alt={book.title}
                                                        />
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {book.title}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                by {book.author}
                                                            </div>
                                                            <div className="text-xs text-gray-400">
                                                                ISBN:{" "}
                                                                {book.isbn}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        {book.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {formatCurrency(book.price)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            book.stock === 0
                                                                ? "bg-red-100 text-red-800"
                                                                : book.stock <
                                                                  10
                                                                ? "bg-yellow-100 text-yellow-800"
                                                                : "bg-green-100 text-green-800"
                                                        }`}
                                                    >
                                                        {book.stock} units
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(book.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            to={`/admin/books/${book.id}`}
                                                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                                            title="View"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                        <Link
                                                            to={`/admin/books/${book.id}/edit`}
                                                            className="text-amber-600 hover:text-amber-900 p-1 rounded"
                                                            title="Edit"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteClick(
                                                                    book
                                                                )
                                                            }
                                                            className="text-red-600 hover:text-red-900 p-1 rounded"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
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
                                                            filteredBooks.length
                                                        )}
                                                    </span>{" "}
                                                    of{" "}
                                                    <span className="font-medium">
                                                        {filteredBooks.length}
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
                                                        disabled={
                                                            currentPage === 1
                                                        }
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
                                                                        index +
                                                                            1
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
                        </div>

                        {/* Empty State */}
                        {filteredBooks.length === 0 && (
                            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No books found
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    {searchTerm || selectedCategory !== "All"
                                        ? "Try adjusting your search or filters"
                                        : "Get started by adding your first book"}
                                </p>
                                <Link
                                    to="/admin/books/add"
                                    className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors font-medium"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add New Book
                                </Link>
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
