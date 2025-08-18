import React, { useState, useEffect } from "react";
import {
    Search,
    Trash2,
    Users,
    Mail,
    AlertCircle,
    Shield,
    ShieldCheck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../utils/api";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [sortBy, setSortBy] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const usersPerPage = 10;

    const statusOptions = ["All", "Active", "Inactive", "Admin"];

    useEffect(() => {
        // Check if user is admin
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user.roles || !user.roles.includes("ROLE_ADMIN")) {
            navigate("/login");
            return;
        }

        loadUsers();
    }, [navigate]);

    useEffect(() => {
        filterAndSortUsers();
    }, [users, searchTerm, selectedStatus, sortBy]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get("/admin/users");
            console.log("Users response:", response);

            setUsers(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Error loading users:", error);
            setError("Failed to load users. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    // Filter and sort users based on search term, status, and sort order
    const filterAndSortUsers = () => {
        let filtered = users.filter((user) => {
            const fullName =
                `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                user.username ||
                user.email;
            const matchesSearch =
                fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());

            let matchesStatus = true;
            if (selectedStatus !== "All") {
                if (selectedStatus === "Admin") {
                    matchesStatus =
                        user.roles && user.roles.includes("ROLE_ADMIN");
                } else if (selectedStatus === "Active") {
                    matchesStatus =
                        user.status === "Active" &&
                        (!user.roles || !user.roles.includes("ROLE_ADMIN"));
                } else if (selectedStatus === "Inactive") {
                    matchesStatus = user.status === "Inactive";
                }
            }

            return matchesSearch && matchesStatus;
        });

        // Sort users
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "name":
                    const nameA =
                        `${a.firstName || ""} ${a.lastName || ""}`.trim() ||
                        a.username ||
                        a.email;
                    const nameB =
                        `${b.firstName || ""} ${b.lastName || ""}`.trim() ||
                        b.username ||
                        b.email;
                    return nameA.localeCompare(nameB);
                case "email":
                    return a.email.localeCompare(b.email);
                case "newest":
                    return (
                        new Date(b.createdAt || b.createdDate) -
                        new Date(a.createdAt || a.createdDate)
                    );
                case "oldest":
                    return (
                        new Date(a.createdAt || a.createdDate) -
                        new Date(b.createdAt || b.createdDate)
                    );
                case "most-orders":
                    return (b.totalOrders || 0) - (a.totalOrders || 0);
                case "highest-spent":
                    return (b.totalSpent || 0) - (a.totalSpent || 0);
                case "last-login":
                    return (
                        new Date(b.lastLogin || b.lastLoginDate) -
                        new Date(a.lastLogin || a.lastLoginDate)
                    );
                default:
                    return 0;
            }
        });

        setFilteredUsers(filtered);
        setCurrentPage(1);
    };

    const handleDeleteClick = (user) => {
        if (user.roles && user.roles.includes("ROLE_ADMIN")) {
            alert("Cannot delete admin users");
            return;
        }
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        setError(null); 

        try {
            await api.delete(`/admin/users/${userToDelete.id}`);

            setShowDeleteModal(false);
            setUserToDelete(null);
            setIsDeleting(false);

            // Reload users after successful deletion
            await loadUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
            setError("Failed to delete user. Please try again.");
            setIsDeleting(false);
        }
    };

    const toggleUserStatus = (userId) => {
        const updatedUsers = users.map((user) => {
            if (user.id === userId && !user.isAdmin) {
                return {
                    ...user,
                    status: user.status === "Active" ? "Inactive" : "Active",
                    updatedAt: new Date().toISOString(),
                };
            }
            return user;
        });

        setUsers(updatedUsers);
        localStorage.setItem("adminUsers", JSON.stringify(updatedUsers));
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

    const getRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffInHours < 1) return "Just now";
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) return `${diffInDays}d ago`;

        const diffInMonths = Math.floor(diffInDays / 30);
        return `${diffInMonths}mo ago`;
    };

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);

    const goToPage = (page) => {
        setCurrentPage(page);
    };

    // Delete confirmation modal
    const DeleteModal = () => (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[6px] z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Delete User
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
                        {userToDelete?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                        {userToDelete?.email}
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

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Users Management
                            </h1>
                            <p className="text-gray-600">
                                Manage your platform users
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
                            className="text-amber-600 border-b-2 border-amber-600 pb-1 font-medium"
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
                            Loading users...
                        </span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Error loading users
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{error}</p>
                                </div>
                                <div className="mt-4">
                                    <button
                                        onClick={loadUsers}
                                        className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Content */}
                {!loading && !error && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Users className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">
                                            Total Users
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {users.length}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center">
                                    <div className="p-2 bg-amber-100 rounded-lg">
                                        <ShieldCheck className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">
                                            Admins
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {
                                                users.filter(
                                                    (element) =>
                                                        element.roles &&
                                                        element.roles.includes("ROLE_ADMIN")
                                                ).length
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters and Search */}
                        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                            <div className="flex flex-col lg:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                        <input
                                            type="text"
                                            placeholder="Search users by name or email..."
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
                                        value={selectedStatus}
                                        onChange={(e) =>
                                            setSelectedStatus(e.target.value)
                                        }
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                                    >
                                        {statusOptions.map((status) => (
                                            <option key={status} value={status}>
                                                {status}
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
                                        <option value="newest">
                                            Newest First
                                        </option>
                                        <option value="oldest">
                                            Oldest First
                                        </option>
                                        <option value="name">Name A-Z</option>
                                        <option value="email">Email A-Z</option>
                                        <option value="most-orders">
                                            Most Orders
                                        </option>
                                        <option value="highest-spent">
                                            Highest Spent
                                        </option>
                                        <option value="last-login">
                                            Last Login
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                                <span>
                                    Showing {startIndex + 1}-
                                    {Math.min(endIndex, filteredUsers.length)}{" "}
                                    of {filteredUsers.length} users
                                </span>
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Joined
                                            </th>
                                            <th className="relative px-6 py-3">
                                                <span className="sr-only">
                                                    Actions
                                                </span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentUsers.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {user.name
                                                                    .split(" ")
                                                                    .map(
                                                                        (n) =>
                                                                            n[0]
                                                                    )
                                                                    .join("")}
                                                            </span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {user.name}
                                                                </div>
                                                                {user.isAdmin && (
                                                                    <Shield
                                                                        className="h-4 w-4 text-amber-500"
                                                                        title="Admin"
                                                                    />
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-gray-500 flex items-center gap-1">
                                                                <Mail className="h-3 w-3" />
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() =>
                                                            toggleUserStatus(
                                                                user.id
                                                            )
                                                        }
                                                        disabled={user.isAdmin}
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                                            user.status ===
                                                            "Active"
                                                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                                : "bg-red-100 text-red-800 hover:bg-red-200"
                                                        } ${
                                                            user.isAdmin
                                                                ? "cursor-not-allowed opacity-50"
                                                                : "cursor-pointer"
                                                        }`}
                                                        title={
                                                            user.isAdmin
                                                                ? "Cannot change admin status"
                                                                : "Click to toggle status"
                                                        }
                                                    >
                                                        {user.status}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(user.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteClick(
                                                                    user
                                                                )
                                                            }
                                                            disabled={
                                                                user.isAdmin
                                                            }
                                                            className={`p-1 rounded ${
                                                                user.isAdmin
                                                                    ? "text-gray-400 cursor-not-allowed"
                                                                    : "text-red-600 hover:text-red-900"
                                                            }`}
                                                            title={
                                                                user.isAdmin
                                                                    ? "Cannot delete admin"
                                                                    : "Delete User"
                                                            }
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
                                                            filteredUsers.length
                                                        )}
                                                    </span>{" "}
                                                    of{" "}
                                                    <span className="font-medium">
                                                        {filteredUsers.length}
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
                        {filteredUsers.length === 0 && (
                            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No users found
                                </h3>
                                <p className="text-gray-500">
                                    {searchTerm || selectedStatus !== "All"
                                        ? "Try adjusting your search or filters"
                                        : "No users have registered yet"}
                                </p>
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
