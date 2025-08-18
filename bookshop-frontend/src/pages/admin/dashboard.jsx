// import React, { useState, useEffect } from "react";
// import {
//     BookOpen,
//     Users,
//     ShoppingCart,
//     DollarSign,
//     Plus,
//     TrendingUp,
//     Package,
//     UserCheck,
//     Calendar,
//     MessageSquare,
//     Star,
// } from "lucide-react";
// import { Link, useNavigate } from "react-router-dom";
// import api from "../../utils/api";

// export default function AdminDashboard() {
//     const [stats, setStats] = useState({
//         totalBooks: 0,
//         totalUsers: 0,
//         totalOrders: 0,
//         totalFeedbacks: 0,
//         totalRevenue: 0,
//         recentOrders: [],
//         topBooks: [],
//         recentUsers: [],
//         recentFeedbacks: [],
//     });

//     const [recentActivity, setRecentActivity] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const navigate = useNavigate();

//     useEffect(() => {
//         // Check if user is admin
//         const user = JSON.parse(localStorage.getItem("user") || "{}");
//         if (!user.roles || !user.roles.includes("ROLE_ADMIN")) {
//             navigate("/login");
//             return;
//         }

//         // Load dashboard data
//         loadDashboardData();
//     }, [navigate]);

//     const loadDashboardData = async () => {
//         try {
//             setLoading(true);
//             setError(null);

//             // Fetch all data in parallel
//             const [
//                 booksResponse,
//                 usersResponse,
//                 ordersResponse,
//                 feedbacksResponse,
//             ] = await Promise.all([
//                 api.get("/books"),
//                 api.get("/admin/users"),
//                 api.get("/admin/orders"),
//                 api.get("/feedback/admin/all").catch(() => ({ data: [] })), // Fallback if endpoint doesn't exist
//             ]);

//             const books = booksResponse.data;
//             const users = usersResponse.data;
//             const orders = ordersResponse.data;
//             const feedbacks = feedbacksResponse.data || [];

//             // Calculate stats
//             const totalRevenue = orders.reduce(
//                 (sum, order) => sum + (order.totalAmount || 0),
//                 0
//             );

//             // Get recent orders (last 5)
//             const recentOrders = orders
//                 .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//                 .slice(0, 5);

//             // Get top selling books
//             const bookSales = {};
//             orders.forEach((order) => {
//                 order.orderItems?.forEach((item) => {
//                     bookSales[item.bookId] =
//                         (bookSales[item.bookId] || 0) + item.quantity;
//                 });
//             });

//             const topBooks = books
//                 .map((book) => ({
//                     ...book,
//                     sold: bookSales[book.id] || 0,
//                 }))
//                 .sort((a, b) => b.sold - a.sold)
//                 .slice(0, 5);

//             // Get recent users (last 5)
//             const recentUsers = users
//                 .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//                 .slice(0, 5);

//             // Get recent feedbacks (last 5)
//             const recentFeedbacks = feedbacks
//                 .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//                 .slice(0, 5);

//             setStats({
//                 totalBooks: books.length,
//                 totalUsers: users.length,
//                 totalOrders: orders.length,
//                 totalFeedbacks: feedbacks.length,
//                 totalRevenue,
//                 recentOrders,
//                 topBooks,
//                 recentUsers,
//                 recentFeedbacks,
//             });

//             // Set recent activity
//             const activities = [
//                 ...orders.slice(0, 3).map((order) => ({
//                     type: "order",
//                     message: `New order #${order.orderNumber} placed by ${order.customerName}`,
//                     time: order.createdAt,
//                     amount: order.totalAmount,
//                 })),
//                 ...recentUsers.slice(0, 2).map((user) => ({
//                     type: "user",
//                     message: `New user ${user.firstName} ${user.lastName} registered`,
//                     time: user.createdAt,
//                 })),
//                 ...recentFeedbacks.slice(0, 2).map((feedback) => ({
//                     type: "feedback",
//                     message: `New feedback from ${
//                         feedback.customerName
//                     }: "${feedback.comment.substring(0, 50)}${
//                         feedback.comment.length > 50 ? "..." : ""
//                     }"`,
//                     time: feedback.createdAt,
//                     rating: feedback.rating,
//                 })),
//             ]
//                 .sort((a, b) => new Date(b.time) - new Date(a.time))
//                 .slice(0, 5);

//             setRecentActivity(activities);
//             setLoading(false);
//         } catch (error) {
//             console.error("Error loading dashboard data:", error);
//             setError("Failed to load dashboard data. Please try again.");
//             setLoading(false);
//         }
//     };

//     const formatCurrency = (amount) => {
//         return new Intl.NumberFormat("en-US", {
//             style: "currency",
//             currency: "USD",
//         }).format(amount);
//     };

//     const formatDate = (dateString) => {
//         return new Date(dateString).toLocaleDateString("en-US", {
//             month: "short",
//             day: "numeric",
//             year: "numeric",
//         });
//     };

//     const StatCard = ({ title, value, icon: Icon, color, change }) => (
//         <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <div className="flex items-center justify-between">
//                 <div>
//                     <p className="text-sm font-medium text-gray-600">{title}</p>
//                     <p className="text-2xl font-bold text-gray-900 mt-2">
//                         {value}
//                     </p>
//                     {change && (
//                         <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
//                             <TrendingUp className="h-3 w-3" />
//                             {change}
//                         </p>
//                     )}
//                 </div>
//                 <div className={`p-3 rounded-full ${color}`}>
//                     <Icon className="h-6 w-6 text-white" />
//                 </div>
//             </div>
//         </div>
//     );

//     return (
//         <div className="min-h-screen bg-gray-50">
//             {/* Header */}
//             <div className="bg-white shadow-sm border-b">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     <div className="flex justify-between items-center py-6">
//                         <div>
//                             <h1 className="text-2xl font-bold text-gray-900">
//                                 Admin Dashboard
//                             </h1>
//                             <p className="text-gray-600">
//                                 Manage your bookshop
//                             </p>
//                         </div>
//                         <div className="flex items-center gap-4">
//                             <button
//                                 onClick={loadDashboardData}
//                                 className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 font-medium"
//                             >
//                                 <TrendingUp className="h-4 w-4" />
//                                 Refresh
//                             </button>
//                             <Link
//                                 to="/admin/books/add"
//                                 className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 font-medium"
//                             >
//                                 <Plus className="h-4 w-4" />
//                                 Add Book
//                             </Link>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Navigation */}
//             <div className="bg-white border-b">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     <nav className="flex space-x-8 py-4">
//                         <Link
//                             to="/admin/dashboard"
//                             className="text-amber-600 border-b-2 border-amber-600 pb-1 font-medium"
//                         >
//                             Dashboard
//                         </Link>
//                         <Link
//                             to="/admin/books"
//                             className="text-gray-500 hover:text-gray-700 pb-1 font-medium transition-colors"
//                         >
//                             Books
//                         </Link>
//                         <Link
//                             to="/admin/users"
//                             className="text-gray-500 hover:text-gray-700 pb-1 font-medium transition-colors"
//                         >
//                             Users
//                         </Link>
//                         <Link
//                             to="/admin/orders"
//                             className="text-gray-500 hover:text-gray-700 pb-1 font-medium transition-colors"
//                         >
//                             Orders
//                         </Link>
//                         <Link
//                             to="/admin/feedbacks"
//                             className="text-gray-500 hover:text-gray-700 pb-1 font-medium transition-colors"
//                         >
//                             Feedbacks
//                         </Link>
//                     </nav>
//                 </div>
//             </div>

//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//                 {/* Loading State */}
//                 {loading && (
//                     <div className="flex items-center justify-center py-12">
//                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
//                         <span className="ml-3 text-gray-600">
//                             Loading dashboard data...
//                         </span>
//                     </div>
//                 )}

//                 {/* Error State */}
//                 {error && (
//                     <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
//                         <div className="flex">
//                             <div className="ml-3">
//                                 <h3 className="text-sm font-medium text-red-800">
//                                     Error loading dashboard
//                                 </h3>
//                                 <div className="mt-2 text-sm text-red-700">
//                                     <p>{error}</p>
//                                 </div>
//                                 <div className="mt-4">
//                                     <button
//                                         onClick={loadDashboardData}
//                                         className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
//                                     >
//                                         Try Again
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Dashboard Content */}
//                 {!loading && !error && (
//                     <>
//                         {/* Stats Cards */}
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
//                             <StatCard
//                                 title="Total Books"
//                                 value={stats.totalBooks}
//                                 icon={BookOpen}
//                                 color="bg-blue-500"
//                                 change="+12% from last month"
//                             />
//                             <StatCard
//                                 title="Total Users"
//                                 value={stats.totalUsers}
//                                 icon={Users}
//                                 color="bg-green-500"
//                                 change="+8% from last month"
//                             />
//                             <StatCard
//                                 title="Total Orders"
//                                 value={stats.totalOrders}
//                                 icon={ShoppingCart}
//                                 color="bg-purple-500"
//                                 change="+15% from last month"
//                             />
//                             <StatCard
//                                 title="Total Feedbacks"
//                                 value={stats.totalFeedbacks}
//                                 icon={MessageSquare}
//                                 color="bg-orange-500"
//                                 change="+25% from last month"
//                             />
//                             <StatCard
//                                 title="Total Revenue"
//                                 value={formatCurrency(stats.totalRevenue)}
//                                 icon={DollarSign}
//                                 color="bg-amber-500"
//                                 change="+20% from last month"
//                             />
//                         </div>

//                         <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
//                             {/* Recent Orders */}
//                             <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//                                 <div className="flex items-center justify-between mb-6">
//                                     <h2 className="text-lg font-semibold text-gray-900">
//                                         Recent Orders
//                                     </h2>
//                                     <Link
//                                         to="/admin/orders"
//                                         className="text-amber-600 hover:text-amber-700 text-sm font-medium"
//                                     >
//                                         View all
//                                     </Link>
//                                 </div>
//                                 <div className="space-y-4">
//                                     {stats.recentOrders.length > 0 ? (
//                                         stats.recentOrders.map((order) => (
//                                             <div
//                                                 key={order.id}
//                                                 className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
//                                             >
//                                                 <div>
//                                                     <p className="font-medium text-gray-900">
//                                                         #{order.orderNumber}
//                                                     </p>
//                                                     <p className="text-sm text-gray-600">
//                                                         {order.customerName}
//                                                     </p>
//                                                 </div>
//                                                 <div className="text-right">
//                                                     <p className="font-semibold text-gray-900">
//                                                         {formatCurrency(
//                                                             order.total
//                                                         )}
//                                                     </p>
//                                                     <p className="text-sm text-gray-600">
//                                                         {formatDate(
//                                                             order.createdAt
//                                                         )}
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                         ))
//                                     ) : (
//                                         <p className="text-gray-500 text-center py-4">
//                                             No orders yet
//                                         </p>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Top Selling Books */}
//                             <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//                                 <div className="flex items-center justify-between mb-6">
//                                     <h2 className="text-lg font-semibold text-gray-900">
//                                         Top Selling Books
//                                     </h2>
//                                     <Link
//                                         to="/admin/books"
//                                         className="text-amber-600 hover:text-amber-700 text-sm font-medium"
//                                     >
//                                         View all
//                                     </Link>
//                                 </div>
//                                 <div className="space-y-4">
//                                     {stats.topBooks.length > 0 ? (
//                                         stats.topBooks.map((book, index) => (
//                                             <div
//                                                 key={book.id}
//                                                 className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
//                                             >
//                                                 <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
//                                                     <span className="text-sm font-bold text-amber-600">
//                                                         #{index + 1}
//                                                     </span>
//                                                 </div>
//                                                 <div className="flex-1">
//                                                     <p className="font-medium text-gray-900">
//                                                         {book.title}
//                                                     </p>
//                                                     <p className="text-sm text-gray-600">
//                                                         by {book.author}
//                                                     </p>
//                                                 </div>
//                                                 <div className="text-right">
//                                                     <p className="font-semibold text-gray-900">
//                                                         {book.sold} sold
//                                                     </p>
//                                                     <p className="text-sm text-gray-600">
//                                                         {formatCurrency(
//                                                             book.price
//                                                         )}
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                         ))
//                                     ) : (
//                                         <p className="text-gray-500 text-center py-4">
//                                             No sales data yet
//                                         </p>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Recent Users */}
//                             <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//                                 <div className="flex items-center justify-between mb-6">
//                                     <h2 className="text-lg font-semibold text-gray-900">
//                                         Recent Users
//                                     </h2>
//                                     <Link
//                                         to="/admin/users"
//                                         className="text-amber-600 hover:text-amber-700 text-sm font-medium"
//                                     >
//                                         View all
//                                     </Link>
//                                 </div>
//                                 <div className="space-y-4">
//                                     {stats.recentUsers.length > 0 ? (
//                                         stats.recentUsers.map((user) => (
//                                             <div
//                                                 key={user.id}
//                                                 className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
//                                             >
//                                                 <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
//                                                     <UserCheck className="h-5 w-5 text-green-600" />
//                                                 </div>
//                                                 <div className="flex-1">
//                                                     <p className="font-medium text-gray-900">
//                                                         {user.name}
//                                                     </p>
//                                                     <p className="text-sm text-gray-600">
//                                                         {user.email}
//                                                     </p>
//                                                 </div>
//                                                 <div className="text-right">
//                                                     <p className="text-sm text-gray-600">
//                                                         {formatDate(
//                                                             user.createdAt
//                                                         )}
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                         ))
//                                     ) : (
//                                         <p className="text-gray-500 text-center py-4">
//                                             No users yet
//                                         </p>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Recent Feedbacks */}
//                             <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//                                 <div className="flex items-center justify-between mb-6">
//                                     <h2 className="text-lg font-semibold text-gray-900">
//                                         Recent Feedbacks
//                                     </h2>
//                                     <Link
//                                         to="/admin/feedbacks"
//                                         className="text-amber-600 hover:text-amber-700 text-sm font-medium"
//                                     >
//                                         View all
//                                     </Link>
//                                 </div>
//                                 <div className="space-y-4">
//                                     {stats.recentFeedbacks.length > 0 ? (
//                                         stats.recentFeedbacks.map(
//                                             (feedback) => (
//                                                 <div
//                                                     key={feedback._id}
//                                                     className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
//                                                 >
//                                                     <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
//                                                         <MessageSquare className="h-5 w-5 text-orange-600" />
//                                                     </div>
//                                                     <div className="flex-1">
//                                                         <div className="flex items-center gap-2 mb-1">
//                                                             <p className="font-medium text-gray-900">
//                                                                 {
//                                                                     feedback.customerName
//                                                                 }
//                                                             </p>
//                                                             <div className="flex items-center">
//                                                                 {[
//                                                                     ...Array(5),
//                                                                 ].map(
//                                                                     (_, i) => (
//                                                                         <Star
//                                                                             key={
//                                                                                 i
//                                                                             }
//                                                                             className={`w-3 h-3 ${
//                                                                                 i <
//                                                                                 feedback.rating
//                                                                                     ? "text-yellow-400 fill-current"
//                                                                                     : "text-gray-300"
//                                                                             }`}
//                                                                         />
//                                                                     )
//                                                                 )}
//                                                             </div>
//                                                         </div>
//                                                         <p className="text-sm text-gray-600 mb-2">
//                                                             {feedback.comment
//                                                                 .length > 100
//                                                                 ? `${feedback.comment.substring(
//                                                                       0,
//                                                                       100
//                                                                   )}...`
//                                                                 : feedback.comment}
//                                                         </p>
//                                                         <p className="text-xs text-gray-500">
//                                                             {formatDate(
//                                                                 feedback.createdAt
//                                                             )}
//                                                         </p>
//                                                     </div>
//                                                 </div>
//                                             )
//                                         )
//                                     ) : (
//                                         <p className="text-gray-500 text-center py-4">
//                                             No feedbacks yet
//                                         </p>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Recent Activity */}
//                             <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//                                 <h2 className="text-lg font-semibold text-gray-900 mb-6">
//                                     Recent Activity
//                                 </h2>
//                                 <div className="space-y-4">
//                                     {recentActivity.length > 0 ? (
//                                         recentActivity.map(
//                                             (activity, index) => (
//                                                 <div
//                                                     key={index}
//                                                     className="flex items-start gap-3"
//                                                 >
//                                                     <div
//                                                         className={`w-8 h-8 rounded-full flex items-center justify-center ${
//                                                             activity.type ===
//                                                             "order"
//                                                                 ? "bg-blue-100"
//                                                                 : activity.type ===
//                                                                   "user"
//                                                                 ? "bg-green-100"
//                                                                 : "bg-orange-100"
//                                                         }`}
//                                                     >
//                                                         {activity.type ===
//                                                         "order" ? (
//                                                             <Package className="h-4 w-4 text-blue-600" />
//                                                         ) : activity.type ===
//                                                           "user" ? (
//                                                             <UserCheck className="h-4 w-4 text-green-600" />
//                                                         ) : (
//                                                             <MessageSquare className="h-4 w-4 text-orange-600" />
//                                                         )}
//                                                     </div>
//                                                     <div className="flex-1">
//                                                         <p className="text-sm text-gray-900">
//                                                             {activity.message}
//                                                         </p>
//                                                         <div className="flex items-center gap-2 mt-1">
//                                                             <Calendar className="h-3 w-3 text-gray-400" />
//                                                             <p className="text-xs text-gray-500">
//                                                                 {formatDate(
//                                                                     activity.time
//                                                                 )}
//                                                             </p>
//                                                             {activity.amount && (
//                                                                 <span className="text-xs font-semibold text-green-600 ml-2">
//                                                                     {formatCurrency(
//                                                                         activity.amount
//                                                                     )}
//                                                                 </span>
//                                                             )}
//                                                             {activity.rating && (
//                                                                 <div className="flex items-center ml-2">
//                                                                     {[
//                                                                         ...Array(
//                                                                             activity.rating
//                                                                         ),
//                                                                     ].map(
//                                                                         (
//                                                                             _,
//                                                                             i
//                                                                         ) => (
//                                                                             <Star
//                                                                                 key={
//                                                                                     i
//                                                                                 }
//                                                                                 className="w-3 h-3 text-yellow-400 fill-current"
//                                                                             />
//                                                                         )
//                                                                     )}
//                                                                 </div>
//                                                             )}
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             )
//                                         )
//                                     ) : (
//                                         <p className="text-gray-500 text-center py-4">
//                                             No recent activity
//                                         </p>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// }
