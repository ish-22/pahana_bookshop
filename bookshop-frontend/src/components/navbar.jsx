import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import { AuthService } from "../utils/auth";
import logo from "../assets/mainLogo.png";

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuthStatus();

        // Handle scroll events
        const handleScroll = () => {
            const scrollTop =
                window.pageYOffset || document.documentElement.scrollTop;
            setIsScrolled(scrollTop > 0);
        };

        // Listen for storage changes to update auth status (for other tabs)
        const handleStorageChange = () => {
            checkAuthStatus();
        };

        // Listen for custom auth status changes (for same tab)
        const handleAuthStatusChange = (event) => {
            const { isAuthenticated, user } = event.detail;
            setIsAuthenticated(isAuthenticated);
            setUser(user);
        };

        // Initial check for scroll position
        window.addEventListener("scroll", handleScroll);
        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("authStatusChanged", handleAuthStatusChange);

        
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener(
                "authStatusChanged",
                handleAuthStatusChange
            );
        };
    }, []);

    const checkAuthStatus = () => {
        const authenticated =
            AuthService.isAuthenticated() && AuthService.isSessionValid();
        setIsAuthenticated(authenticated);
        setUser(authenticated ? AuthService.getCurrentUser() : null);
    };

    const handleLogout = () => {
        // Clear cart on logout by default (normal behavior)
        AuthService.logout(true); 
        setIsAuthenticated(false);
        setUser(null);
        navigate("/");
        setIsOpen(false);

        // Dispatch custom event to notify other components about logout
        window.dispatchEvent(
            new CustomEvent("authStatusChanged", {
                detail: { isAuthenticated: false, user: null },
            })
        );
    };

    return (
        <nav className="bg-opacity-80 bg-transparent backdrop-blur-lg shadow-md md:px-30 px-15 py-3 sticky top-0 z-50 ">
            <div className="max-w-8xl mx-auto flex justify-between items-center">
                <div>
                    <Link to="/" className="text-2xl font-bold text-white ">
                        <img
                            src={logo}
                            alt="logo "
                            className="md:w-15.5 w-12 transition-all"
                        />
                    </Link>
                </div>

                <div className="hidden md:flex space-x-6 items-center">
                    <Link
                        to="/"
                        className={`text-letter font-semibold hover:text-amber-500 ${
                            isScrolled
                                ? "text-black hover:text-amber-950"
                                : "text-basecolor"
                        }`}
                    >
                        Home
                    </Link>
                    <Link
                        to="/books"
                        className={`text-letter font-semibold hover:text-amber-500 ${
                            isScrolled
                                ? "text-black hover:text-amber-950"
                                : "text-basecolor"
                        }`}
                    >
                        Books
                    </Link>

                    {isAuthenticated ? (
                        <div className="flex items-center space-x-4">
                            {/* Admin Panel Link */}
                            {user?.isAdmin && (
                                <Link
                                    to="/admin/dashboard"
                                    className={`flex items-center space-x-1 hover:text-amber-500 ${
                                        isScrolled
                                            ? "text-black hover:text-amber-950"
                                            : "text-basecolor"
                                    }`}
                                >
                                    <span className="text-letter font-semibold">
                                        Dashboard
                                    </span>
                                </Link>
                            )}

                            {/* User Menu */}
                            <div
                                className={`flex items-center space-x-2 mr-5 ${
                                    isScrolled
                                        ? "text-black hover:text-amber-950"
                                        : "text-basecolor"
                                }`}
                            >
                                <User
                                    className="text-letter font-semibold"
                                    size={20}
                                />
                                <span className="text-letter font-semibold">
                                    {user?.name || user?.email}
                                </span>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="bg-red-500 text-white font-semibold px-3.5 py-1.5 rounded-lg hover:bg-red-700 transition-all"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="mt-1 mb-1 ml-4">
                            <Link
                                to="/login"
                                className={`bg-basecolor text-letter text-black font-semibold px-3.5 py-1.5 rounded-lg hover:bg-amber-900 hover:text-white transition-all ${
                                    isScrolled
                                        ? "bg-black text-white"
                                        : "bg-white text-black"
                                } `}
                            >
                                Login
                            </Link>
                        </div>
                    )}
                </div>

                <div className="md:hidden">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`font-extrabold ${
                            isScrolled ? "text-black" : "text-basecolor"
                        }`}
                    >
                        {isOpen ? <X size={36} /> : <Menu size={36} />}
                    </button>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-navbase bg-opacity-80 backdrop-blur-sm z-40 py-6 flex flex-col items-center space-y-6 shadow-md">
                    <Link
                        to="/"
                        onClick={() => setIsOpen(false)}
                        className={`text-letter font-semibold hover:text-gray-300 ${
                            isScrolled ? "text-black" : "text-basecolor"
                        }`}
                    >
                        Home
                    </Link>
                    <Link
                        to="/books"
                        onClick={() => setIsOpen(false)}
                        className={`text-letter font-semibold hover:text-gray-300 ${
                            isScrolled ? "text-black" : "text-basecolor"
                        }`}
                    >
                        Books
                    </Link>

                    {isAuthenticated ? (
                        <>
                            {/* Admin Panel for mobile */}
                            {user?.isAdmin && (
                                <Link
                                    to="/admin/dashboard"
                                    onClick={() => setIsOpen(false)}
                                    className={`hover:text-gray-300 flex items-center space-x-2 ${
                                        isScrolled
                                            ? "text-black"
                                            : "text-basecolor"
                                    }`}
                                >
                                    <span className="font-semibold text-letter">
                                        Dashboard
                                    </span>
                                </Link>
                            )}

                            <div
                                className={`text-center mb-7 ${
                                    isScrolled ? "text-black" : "text-basecolor"
                                }`}
                            >
                                <User size={20} className="mx-auto mb-1" />
                                <p className="text-letter font-semibold">
                                    {user?.name || user?.email}
                                </p>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="bg-red-500 text-white font-semibold px-3.5 py-1.5 rounded-lg hover:bg-red-600"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            onClick={() => setIsOpen(false)}
                            className="bg-basecolor text-letter text-black font-semibold px-3.5 py-1.5 rounded-lg hover:bg-gray-200 "
                        >
                            Login
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
};
