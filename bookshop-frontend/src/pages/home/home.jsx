import { useState, useEffect, use } from "react";
import { Link } from "react-router-dom";
import { AuthService } from "../../utils/auth";
import { FeedbackSection } from "../../components/FeedbackSection";
import apiService from "../../utils/api";
import { useCart } from "../../hooks/useCart";
import hero from "../../assets/bgImages/background4.jpg";

const slideImages = [
    "https://books.google.lk/books/publisher/content?id=fo5REQAAQBAJ&pg=PA1&img=1&zoom=3&hl=en&bul=1&sig=ACfU3U1JPo9J8o2UqMIQ1Se8bfLWB2EPZA&w=1280",
    "https://cdn.kobo.com/book-images/6dc1746e-f30b-46f6-9695-276e01405aca/1200/1200/False/sherlock-s-home-1.jpg",
    "https://mpd-biblio-covers.imgix.net/9781250846747.jpg?w=900dpr=1",
    "https://rukminim2.flixcart.com/image/704/844/xif0q/book/m/c/n/algorithms-original-imags2y8639x6jwr.jpeg?q=90&crop=false",
    "https://mpd-biblio-covers.imgix.net/9781250864741.jpg?w=900dpr=2",
    "https://mpd-biblio-covers.imgix.net/9781250360519.jpg?w=900dpr=1",
    "https://bargainbooks.lk/wp-content/uploads/81ZYwiGNGgL._SL1500_.jpg",
];

export const Home = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [showWelcome, setShowWelcome] = useState(false);
    const [bookCount, setBookCount] = useState(0);
    const [categoryCount, setCategoryCount] = useState(0);
    const [statsLoading, setStatsLoading] = useState(true);

    // Include cart hook to ensure cart persists when user visits home
    const { cart } = useCart();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slideImages.length);
        }, 4000);

        return () => clearInterval(timer);
    }, []);

    // Fetch book statistics
    useEffect(() => {
        const fetchBookStats = async () => {
            try {
                setStatsLoading(true);
                const stats = await apiService.getBookStats();
                setBookCount(stats.totalBooks || 0);
                setCategoryCount(stats.categoryCount || 0);
            } catch (error) {
                console.error("Failed to fetch book statistics:", error);
            } finally {
                setStatsLoading(false);
            }
        };

        fetchBookStats();
    }, []);

    useEffect(() => {
        // Check authentication status
        const checkAuth = () => {
            const authenticated =
                AuthService.isAuthenticated() && AuthService.isSessionValid();
            const userData = AuthService.getCurrentUser();
            setIsAuthenticated(authenticated);
            setUser(userData);

            // Show welcome message for recent login or when user just logged in
            if (authenticated && userData) {
                const loginTime = userData.loginTime;
                if (loginTime) {
                    const timeSinceLogin =
                        new Date().getTime() - new Date(loginTime).getTime();
                    if (timeSinceLogin < 10000) {
                        // Less than 10 seconds ago
                        setShowWelcome(true);
                        setTimeout(() => setShowWelcome(false), 5000);
                    }
                }
            }
        };

        checkAuth();

        // Listen for auth status changes
        const handleAuthChange = (event) => {
            const { isAuthenticated, user } = event.detail;
            setIsAuthenticated(isAuthenticated);
            setUser(user);

            if (isAuthenticated && user) {
                setShowWelcome(true);
                setTimeout(() => setShowWelcome(false), 5000);
            }
        };

        window.addEventListener("authStatusChanged", handleAuthChange);

        return () => {
            window.removeEventListener("authStatusChanged", handleAuthChange);
        };
    }, []);

    return (
        <main>
            {/* Welcome notification */}
            {showWelcome && isAuthenticated && user && (
                <div className="fixed top-20 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="font-medium">
                            Welcome back, {user.name || user.email}! 🎉
                        </span>
                    </div>
                </div>
            )}

            {/* Section 1 - Hero Section */}
            <section
                className="relative min-h-screen bg-cover bg-center bg-no-repeat overflow-hidden"
                style={{
                    backgroundImage: `url(${hero})`,
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent z-5 backdrop-blur-[5px]"></div>

                <div className=" relative z-10 flex flex-col lg:flex-row items-center min-h-screen px-10 sm:px-6 md:px-12 lg:px-16 xl:px-20 mt-10 lg:mt-0 ml-0 sm:ml-20">
                    <div className=" flex-1 text-white max-w-4xl text-center lg:text-left">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-bold leading-tight mb-6">
                            {isAuthenticated && user ? (
                                <>
                                    Welcome back,
                                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 to-green-100">
                                        {user.name || user.email}!
                                    </span>
                                </>
                            ) : (
                                <>
                                    Welcome to the
                                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 to-green-100">
                                        Pahana Edu
                                    </span>
                                </>
                            )}
                        </h1>

                        <p className="mt-6 text-lg sm:text-xl md:text-2xl text-gray-200 leading-relaxed max-w-3xl mx-auto lg:mx-0">
                            Pahana fuels learning journeys with books that spark
                            critical thinking and creativity.
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            {isAuthenticated ? (
                                <Link
                                    to="/books"
                                    className="px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-800 text-basecolor font-semibold rounded-xl hover:from-amber-900 hover:to-amber-900 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Browse Books
                                </Link>
                            ) : (
                                <Link
                                    to="/books"
                                    className="px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-800 text-basecolor font-semibold rounded-xl hover:from-amber-900 hover:to-amber-900 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Find Book
                                </Link>
                            )}
                            <a
                                href="#customer"
                                className="group px-8 py-4 bg-white/10 text-white font-semibold rounded-xl backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 hover:border-white/40 relative overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Learn More
                                </span>
                            </a>
                        </div>

                        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-2xl mx-auto lg:mx-0">
                            <div className="text-center lg:text-left">
                                <div className="text-3xl font-bold text-yellow-50">
                                    {statsLoading ? (
                                        <span className="animate-pulse">
                                            --
                                        </span>
                                    ) : (
                                        `${bookCount}+`
                                    )}
                                </div>
                                <div className="text-gray-300 mt-1">Books</div>
                            </div>
                            <div className="text-center lg:text-left">
                                <div className="text-3xl font-bold text-yellow-50">
                                    {statsLoading ? (
                                        <span className="animate-pulse">
                                            --
                                        </span>
                                    ) : (
                                        `${categoryCount}+`
                                    )}
                                </div>
                                <div className="text-gray-300 mt-1">
                                    Types of Books
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="  lg:flex flex-1 justify-center items-center ml-0 sm:ml-8 mr-0 mt-15 lg:mt-0 mb-15 lg:mb-0">
                        <div className="relative w-79 sm:w-96 h-120 sm:h-145 max-w-md">
                            <div className="relative w-full h-full rounded-[10px] overflow-hidden shadow-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                                {slideImages.map((image, index) => (
                                    <div
                                        key={index}
                                        className={`absolute inset-0 transition-all duration-700 ease-linear ${
                                            index === currentSlide
                                                ? "opacity-100 scale-100"
                                                : "opacity-0 scale-100"
                                        }`}
                                    >
                                        <img
                                            src={image}
                                            alt={`Educational slide ${
                                                index + 1
                                            }`}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                                    </div>
                                ))}
                            </div>

                            <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-green-400 rounded-full blur-sm opacity-70 animate-pulse"></div>
                            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-sm opacity-70 animate-pulse delay-1000"></div>
                            <div className="absolute top-1/2 -left-6 w-4 h-4 bg-gradient-to-r from-pink-400 to-red-400 rounded-full blur-sm opacity-50 animate-pulse delay-2000"></div>
                        </div>
                    </div>
                </div>

                <div className="absolute top-20 right-10 w-20 h-20 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-green-500/10 rounded-full blur-xl animate-pulse delay-2000"></div>

                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                        <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
                    </div>
                </div>
            </section>

            {/*Section 2 - Customer Feedbacks */}
            <section id="customer"></section>
            <FeedbackSection />
        </main>
    );
};
