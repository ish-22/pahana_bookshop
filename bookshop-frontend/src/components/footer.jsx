import { Link } from "react-router-dom";
import logo from "../assets/mainLogo.png";

export const Footer = () => {
    return (
        <footer className="bg-navbase bg-opacity-80 backdrop-blur-sm text-basecolor px-6 md:px-30 py-10">
            <div className="max-w-8xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                <div>
                    <Link to="/" className="inline-block mb-4">
                        <img
                            src={logo}
                            alt="Logo"
                            className="w-16 md:w-19 mx-auto md:mx-0"
                        />
                    </Link>
                    <p className="text-sm font-semibold text-white">
                        Lighting minds through every page.
                    </p>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                    <ul className="space-y-2">
                        <li>
                            <Link
                                to="/"
                                className="hover:text-amber-500 font-semibold"
                            >
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/books"
                                className="hover:text-amber-500 font-semibold"
                            >
                                Books
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/login"
                                className="hover:text-amber-500 font-semibold"
                            >
                                Login
                            </Link>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-4">Contact</h3>
                    <p className="text-sm font-semibold text-white">
                        Email: pahanaedu@gmail.com
                    </p>
                    <p className="text-sm font-semibold text-white mt-2">
                        Phone: +94 76 527 4750
                    </p>
                    <p className="text-sm text-white-400 mt-6">
                        &copy; {new Date().getFullYear()} pahana-edu. All rights
                        reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};
