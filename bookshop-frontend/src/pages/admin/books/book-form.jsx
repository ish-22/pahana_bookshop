import React, { useState, useEffect } from "react";
import {
    ArrowLeft,
    Save,
    X,
    Upload,
    BookOpen,
    AlertCircle,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../../utils/api";

export default function AdminBookForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState({
        title: "",
        author: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        isbn: "",
        publisher: "",
        publishedDate: "",
        pages: "",
        image: "",
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState("");

    const categories = [
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
        "Science Fiction",
        "Mystery",
        "Thriller",
        "Biography",
        "Self-Help",
        "Poetry",
        "Drama",
        "Other"
    ];

    useEffect(() => {
        // Check if user is admin
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user.roles || !user.roles.includes("ROLE_ADMIN")) {
            navigate("/login");
            return;
        }

        if (isEditing) {
            loadBook();
        }
    }, [id, isEditing, navigate]);

    const loadBook = async () => {
        try {
            const response = await api.get(`/books/${id}`);
            const book = response;

            if (book) {
                setFormData({
                    title: book.title || "",
                    author: book.author || "",
                    description: book.description || "",
                    price: book.price?.toString() || "",
                    category: book.category || "",
                    stock: book.stock?.toString() || "",
                    isbn: "", 
                    publisher: "", 
                    publishedDate: "", 
                    pages: "",
                    image: book.image || "",
                });
                setImagePreview(book.image || "");
            } else {
                navigate("/admin/books");
            }
        } catch (error) {
            console.error("Error loading book:", error);
            navigate("/admin/books");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = `/src/assets/Default/d${
                Math.floor(Math.random() * 3) + 1
            }.jpg`;
            setFormData((prev) => ({
                ...prev,
                image: imageUrl,
            }));
            setImagePreview(imageUrl);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        }

        if (!formData.author.trim()) {
            newErrors.author = "Author is required";
        }

        if (!formData.description.trim()) {
            newErrors.description = "Description is required";
        }

        if (!formData.price) {
            newErrors.price = "Price is required";
        } else if (
            isNaN(parseFloat(formData.price)) ||
            parseFloat(formData.price) <= 0
        ) {
            newErrors.price = "Price must be a valid positive number";
        }

        if (!formData.category) {
            newErrors.category = "Category is required";
        }

        if (!formData.stock) {
            newErrors.stock = "Stock is required";
        } else if (
            isNaN(parseInt(formData.stock)) ||
            parseInt(formData.stock) < 0
        ) {
            newErrors.stock = "Stock must be a valid non-negative number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const bookData = {
                title: formData.title,
                author: formData.author,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category,
                stock: parseInt(formData.stock),
                image: formData.image,
            };

            if (isEditing) {
                // Update existing book
                await api.put(`/admin/books/${id}`, bookData);
            } else {
                // Add new book
                await api.post("/admin/books", bookData);
            }

            navigate("/admin/books");
        } catch (error) {
            console.error("Error saving book:", error);
            setErrors({ submit: "Failed to save book. Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-6">
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
                                    {isEditing ? "Edit Book" : "Add New Book"}
                                </h1>
                                <p className="text-gray-600">
                                    {isEditing
                                        ? "Update book information"
                                        : "Add a new book to your inventory"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                <p className="text-red-600 font-medium">
                                    Error
                                </p>
                            </div>
                            <p className="text-red-600 text-sm mt-1">
                                {errors.submit}
                            </p>
                        </div>
                    )}

                    {/* Basic Information */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Basic Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                                        errors.title
                                            ? "border-red-300 bg-red-50"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="Enter book title"
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Author *
                                </label>
                                <input
                                    type="text"
                                    name="author"
                                    value={formData.author}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                                        errors.author
                                            ? "border-red-300 bg-red-50"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="Enter author name"
                                />
                                {errors.author && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.author}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category *
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                                        errors.category
                                            ? "border-red-300 bg-red-50"
                                            : "border-gray-300"
                                    }`}
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                                {errors.category && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.category}
                                    </p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none ${
                                        errors.description
                                            ? "border-red-300 bg-red-50"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="Enter book description"
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pricing and Inventory */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">
                            Pricing & Inventory
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price ($) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                                        errors.price
                                            ? "border-red-300 bg-red-50"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="0.00"
                                />
                                {errors.price && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.price}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Stock Quantity *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                                        errors.stock
                                            ? "border-red-300 bg-red-50"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="0"
                                />
                                {errors.stock && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.stock}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Publishing Information */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">
                            Publishing Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ISBN *
                                </label>
                                <input
                                    type="text"
                                    name="isbn"
                                    value={formData.isbn}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                                        errors.isbn
                                            ? "border-red-300 bg-red-50"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="978-0123456789"
                                />
                                {errors.isbn && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.isbn}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Publisher *
                                </label>
                                <input
                                    type="text"
                                    name="publisher"
                                    value={formData.publisher}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                                        errors.publisher
                                            ? "border-red-300 bg-red-50"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="Enter publisher name"
                                />
                                {errors.publisher && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.publisher}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Published Date *
                                </label>
                                <input
                                    type="date"
                                    name="publishedDate"
                                    value={formData.publishedDate}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                                        errors.publishedDate
                                            ? "border-red-300 bg-red-50"
                                            : "border-gray-300"
                                    }`}
                                />
                                {errors.publishedDate && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.publishedDate}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Number of Pages *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    name="pages"
                                    value={formData.pages}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                                        errors.pages
                                            ? "border-red-300 bg-red-50"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="0"
                                />
                                {errors.pages && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.pages}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Book Cover */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">
                            Book Cover
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cover Image *
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className="cursor-pointer inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        <Upload className="h-4 w-4" />
                                        Upload Image
                                    </label>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Or enter image URL below
                                    </p>
                                </div>

                                <div className="mt-4">
                                    <input
                                        type="url"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                                            errors.image
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-300"
                                        }`}
                                        placeholder="https://example.com/book-cover.jpg"
                                    />
                                    {errors.image && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.image}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Preview
                                </label>
                                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Book cover preview"
                                            className="w-32 h-40 object-cover rounded mx-auto"
                                        />
                                    ) : (
                                        <div className="w-32 h-40 bg-gray-200 rounded mx-auto flex items-center justify-center">
                                            <BookOpen className="h-8 w-8 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex items-center justify-end gap-4 pt-6">
                        <Link
                            to="/admin/books"
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    {isEditing ? "Updating..." : "Adding..."}
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    {isEditing ? "Update Book" : "Add Book"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
