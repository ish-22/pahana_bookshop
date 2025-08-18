import { Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/navbar";
import { Footer } from "./components/footer";
import { Home } from "./pages/home/home";
import Books from "./pages/books/books";
import Login from "./pages/auth/login";
import Signup from "./pages/auth/signup";
import Checkout from "./pages/checkout/checkout";
import OrderConfirmation from "./pages/checkout/order-confirmation";
import AdminBooks from "./pages/admin/books/books";
import AdminUsers from "./pages/admin/users/users";
import AdminOrders from "./pages/admin/orders/orders";
import AdminFeedbacks from "./pages/admin/feedbacks/feedbacks";
import AdminBookForm from "./pages/admin/books/book-form";
import AdminBookDetail from "./pages/admin/books/book-detail";
import NotFound from "./pages/not-found/not-found";

export const App = () => {
    return (
        <div>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/books" element={<Books />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route
                    path="/order-confirmation"
                    element={<OrderConfirmation />}
                />

                {/* Admin Routes */}
                <Route
                    path="/admin"
                    element={<Navigate to="/admin/books" replace />}
                />
                <Route
                    path="/admin/dashboard"
                    element={<Navigate to="/admin/books" replace />}
                />
                <Route path="/admin/books" element={<AdminBooks />} />
                <Route path="/admin/books/add" element={<AdminBookForm />} />
                <Route path="/admin/books/:id" element={<AdminBookDetail />} />
                <Route
                    path="/admin/books/:id/edit"
                    element={<AdminBookForm />}
                />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/feedbacks" element={<AdminFeedbacks />} />

                {/* Route for 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
        </div>
    );
};
