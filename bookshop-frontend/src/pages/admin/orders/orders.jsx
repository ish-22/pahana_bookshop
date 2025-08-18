import React, { useState, useEffect } from "react";
import {
    Search,
    Eye,
    Package,
    Truck,
    CheckCircle,
    Clock,
    AlertCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../utils/api";

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [sortBy, setSortBy] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const ordersPerPage = 10;

    const statusOptions = [
        "All",
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
    ];

    const statusColors = {
        Pending: "bg-yellow-100 text-yellow-800",
        Processing: "bg-blue-100 text-blue-800",
        Shipped: "bg-purple-100 text-purple-800",
        Delivered: "bg-green-100 text-green-800",
        Cancelled: "bg-red-100 text-red-800",
    };

    const statusIcons = {
        Pending: Clock,
        Processing: Package,
        Shipped: Truck,
        Delivered: CheckCircle,
        Cancelled: AlertCircle,
    };

    useEffect(() => {
        // Check if user is admin
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user.roles || !user.roles.includes("ROLE_ADMIN")) {
            navigate("/login");
            return;
        }

        loadOrders();
    }, [navigate]);

    useEffect(() => {
        filterAndSortOrders();
    }, [orders, searchTerm, selectedStatus, sortBy]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get("/admin/orders");
            console.log("Orders response:", response);

            // The response is the array directly, not wrapped in data
            setOrders(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Error loading orders:", error);
            setError("Failed to load orders. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    const filterAndSortOrders = () => {
        let filtered = orders.filter((order) => {
            const orderNumber = order.orderNumber || order.id || "";
            const customerName =
                order.customerName ||
                order.user?.username ||
                order.user?.email ||
                "";
            const customerEmail =
                order.customerEmail || order.user?.email || "";

            const matchesSearch =
                orderNumber
                    .toString()
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus =
                selectedStatus === "All" || order.status === selectedStatus;

            return matchesSearch && matchesStatus;
        });

        // Sort orders
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return (
                        new Date(b.createdAt || b.orderDate) -
                        new Date(a.createdAt || a.orderDate)
                    );
                case "oldest":
                    return (
                        new Date(a.createdAt || a.orderDate) -
                        new Date(b.createdAt || b.orderDate)
                    );
                case "total-high":
                    return (
                        (b.total || b.totalAmount || 0) -
                        (a.total || a.totalAmount || 0)
                    );
                case "total-low":
                    return (
                        (a.total || a.totalAmount || 0) -
                        (b.total || b.totalAmount || 0)
                    );
                case "status":
                    return (a.status || "").localeCompare(b.status || "");
                default:
                    return 0;
            }
        });

        setFilteredOrders(filtered);
        setCurrentPage(1);
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await api.put(`/admin/orders/${orderId}/status`, {
                status: newStatus,
            });

            // Reload orders after successful update
            await loadOrders();
        } catch (error) {
            console.error("Error updating order status:", error);
            setError("Failed to update order status. Please try again.");
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    // Calculate pagination
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const currentOrders = filteredOrders.slice(startIndex, endIndex);

    // Order Details Modal Component
    const OrderModal = () => {
        if (!selectedOrder) return null;

        return (
            <div className="fixed  inset-0 bg-opacity-50 backdrop-blur-[4px] flex items-center justify-center z-50">
                <div className="bg-gray-200 border border-gray-300 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">
                                Order Details -{" "}
                                {selectedOrder.orderNumber || selectedOrder.id}
                            </h2>
                            <button
                                onClick={() => setShowOrderModal(false)}
                                className="text-gray-600 hover:text-black text-2xl"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Order Info */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                        Order Information
                                    </h3>
                                    <div className="space-y-2">
                                        <p>
                                            <span className="font-medium">
                                                Order ID:
                                            </span>{" "}
                                            {selectedOrder.orderNumber ||
                                                selectedOrder.id}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                Status:
                                            </span>
                                            <span
                                                className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                                    statusColors[
                                                        selectedOrder.status
                                                    ] ||
                                                    "bg-gray-100 text-gray-800"
                                                }`}
                                            >
                                                {selectedOrder.status}
                                            </span>
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                Total:
                                            </span>{" "}
                                            {formatCurrency(
                                                selectedOrder.total ||
                                                    selectedOrder.totalAmount
                                            )}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                Order Date:
                                            </span>{" "}
                                            {formatDate(
                                                selectedOrder.createdAt ||
                                                    selectedOrder.orderDate
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                        Customer Information
                                    </h3>
                                    <div className="space-y-2">
                                        <p>
                                            <span className="font-medium">
                                                Name:
                                            </span>{" "}
                                            {selectedOrder.customerName ||
                                                selectedOrder.user?.username ||
                                                "N/A"}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                Email:
                                            </span>{" "}
                                            {selectedOrder.customerEmail ||
                                                selectedOrder.user?.email ||
                                                "N/A"}
                                        </p>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                {selectedOrder.shippingAddress && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                            Shipping Address
                                        </h3>
                                        <div className="space-y-1">
                                            <p>
                                                {
                                                    selectedOrder
                                                        .shippingAddress.address
                                                }
                                            </p>
                                            <p>
                                                {
                                                    selectedOrder
                                                        .shippingAddress.city
                                                }
                                                ,{" "}
                                                {
                                                    selectedOrder
                                                        .shippingAddress.state
                                                }{" "}
                                                {
                                                    selectedOrder
                                                        .shippingAddress.zipCode
                                                }
                                            </p>
                                            <p>
                                                {
                                                    selectedOrder
                                                        .shippingAddress.country
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    Order Items
                                </h3>
                                <div className="space-y-3">
                                    {(
                                        selectedOrder.items ||
                                        selectedOrder.orderItems ||
                                        []
                                    ).map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {item.title ||
                                                        item.book?.title}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    by{" "}
                                                    {item.author ||
                                                        item.book?.author}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Quantity: {item.quantity}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">
                                                    {formatCurrency(
                                                        item.price ||
                                                            item.book?.price
                                                    )}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Total:{" "}
                                                    {formatCurrency(
                                                        (item.price ||
                                                            item.book?.price ||
                                                            0) * item.quantity
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Status Update */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                Update Status
                            </h3>
                            <div className="flex gap-2 flex-wrap">
                                {statusOptions
                                    .filter((status) => status !== "All")
                                    .map((status) => (
                                        <button
                                            key={status}
                                            onClick={() =>
                                                handleStatusUpdate(
                                                    selectedOrder.id,
                                                    status
                                                )
                                            }
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                selectedOrder.status === status
                                                    ? statusColors[status]
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Orders Management
                            </h1>
                            <p className="text-gray-600">
                                Manage customer orders and fulfillment
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
                            className="text-amber-600 border-b-2 border-amber-600 pb-1 font-medium"
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
                            Loading orders...
                        </span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Error loading orders
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{error}</p>
                                </div>
                                <div className="mt-4">
                                    <button
                                        onClick={loadOrders}
                                        className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Orders Content */}
                {!loading && !error && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Package className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">
                                            Total Orders
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {orders.length}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center">
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <Clock className="h-6 w-6 text-yellow-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">
                                            Pending
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {
                                                orders.filter(
                                                    (order) =>
                                                        order.status ===
                                                        "Pending"
                                                ).length
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <Truck className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">
                                            Shipped
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {
                                                orders.filter(
                                                    (order) =>
                                                        order.status ===
                                                        "Shipped"
                                                ).length
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">
                                            Delivered
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {
                                                orders.filter(
                                                    (order) =>
                                                        order.status ===
                                                        "Delivered"
                                                ).length
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters and Search */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search orders..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="sm:w-48">
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) =>
                                            setSelectedStatus(e.target.value)
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    >
                                        {statusOptions.map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="sm:w-48">
                                    <select
                                        value={sortBy}
                                        onChange={(e) =>
                                            setSortBy(e.target.value)
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    >
                                        <option value="newest">
                                            Newest First
                                        </option>
                                        <option value="oldest">
                                            Oldest First
                                        </option>
                                        <option value="total-high">
                                            Highest Total
                                        </option>
                                        <option value="total-low">
                                            Lowest Total
                                        </option>
                                        <option value="status">Status</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Orders Table */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Order
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Customer
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentOrders.map((order) => (
                                            <tr
                                                key={order.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {order.orderNumber ||
                                                                order.id}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {
                                                                (
                                                                    order.items ||
                                                                    order.orderItems ||
                                                                    []
                                                                ).length
                                                            }{" "}
                                                            items
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {order.customerName ||
                                                                order.user
                                                                    ?.username ||
                                                                "N/A"}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {order.customerEmail ||
                                                                order.user
                                                                    ?.email ||
                                                                "N/A"}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            statusColors[
                                                                order.status
                                                            ] ||
                                                            "bg-gray-100 text-gray-800"
                                                        }`}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatCurrency(
                                                        order.total ||
                                                            order.totalAmount
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(
                                                        order.createdAt ||
                                                            order.orderDate
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedOrder(
                                                                order
                                                            );
                                                            setShowOrderModal(
                                                                true
                                                            );
                                                        }}
                                                        className="text-amber-600 hover:text-amber-900 flex items-center gap-1"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        View
                                                    </button>
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
                                        <div className="flex items-center">
                                            <p className="text-sm text-gray-700">
                                                Showing{" "}
                                                <span className="font-medium">
                                                    {startIndex + 1}
                                                </span>{" "}
                                                to{" "}
                                                <span className="font-medium">
                                                    {Math.min(
                                                        endIndex,
                                                        filteredOrders.length
                                                    )}
                                                </span>{" "}
                                                of{" "}
                                                <span className="font-medium">
                                                    {filteredOrders.length}
                                                </span>{" "}
                                                results
                                            </p>
                                        </div>
                                        <nav className="flex items-center space-x-2">
                                            <button
                                                onClick={() =>
                                                    setCurrentPage(
                                                        Math.max(
                                                            1,
                                                            currentPage - 1
                                                        )
                                                    )
                                                }
                                                disabled={currentPage === 1}
                                                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Previous
                                            </button>
                                            <span className="text-sm text-gray-700">
                                                Page {currentPage} of{" "}
                                                {totalPages}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    setCurrentPage(
                                                        Math.min(
                                                            totalPages,
                                                            currentPage + 1
                                                        )
                                                    )
                                                }
                                                disabled={
                                                    currentPage === totalPages
                                                }
                                                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Next
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Empty State */}
                        {filteredOrders.length === 0 && (
                            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No orders found
                                </h3>
                                <p className="text-gray-500">
                                    {searchTerm || selectedStatus !== "All"
                                        ? "Try adjusting your search or filters"
                                        : "No orders have been placed yet"}
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Order Modal */}
            {showOrderModal && <OrderModal />}
        </div>
    );
}
