import { Link } from "react-router-dom";
import { Home, Book, ArrowLeft } from "lucide-react";

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-dashbg)' }}>
            <div className="max-w-2xl mx-auto text-center">
                <div className="mb-6">
                    <div className="text-6xl md:text-8xl font-bold opacity-15 select-none" style={{ color: 'var(--color-navbase)' }}>
                        404
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--color-textV1)' }}>
                        Oops! Page Not Found
                    </h1>
                    
                    <div className="space-y-2">
                        <p className="text-base md:text-lg opacity-80" style={{ color: 'var(--color-textV1)' }}>
                            The page you're looking for seems to have wandered off into the digital wilderness.
                        </p>
                        <p className="text-sm opacity-70" style={{ color: 'var(--color-textV1)' }}>
                            Don't worry though – we'll help you find your way back to safety!
                        </p>
                    </div>
                </div>

  
                <div className="grid md:grid-cols-2 gap-3 mb-6">
                    <Link 
                        to="/" 
                        className="group relative overflow-hidden rounded-lg p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        style={{ backgroundColor: 'var(--color-navbase)' }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                        <div className="relative flex flex-col items-center space-y-2">
                            <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-secBase)' }}>
                                <Home className="w-5 h-5" style={{ color: 'var(--color-navbase)' }} />
                            </div>
                            <span className="font-semibold text-sm" style={{ color: 'var(--color-navbase2)' }}>
                                Return Home
                            </span>
                            <span className="text-xs opacity-75" style={{ color: 'var(--color-navbase2)' }}>
                                Back to safety
                            </span>
                        </div>
                    </Link>

                    <Link 
                        to="/books" 
                        className="group relative overflow-hidden rounded-lg p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        style={{ backgroundColor: 'var(--color-secBase)' }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        <div className="relative flex flex-col items-center space-y-2">
                            <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-navbase)' }}>
                                <Book className="w-5 h-5" style={{ color: 'var(--color-navbase2)' }} />
                            </div>
                            <span className="font-semibold text-sm" style={{ color: 'var(--color-navbase)' }}>
                                Browse Books
                            </span>
                            <span className="text-xs opacity-75" style={{ color: 'var(--color-navbase)' }}>
                                Discover stories
                            </span>
                        </div>
                    </Link>
                </div>

                <button 
                    onClick={() => window.history.back()} 
                    className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg border-2 transition-all duration-300 hover:scale-105"
                    style={{ 
                        borderColor: 'var(--color-navbase)',
                        color: 'var(--color-navbase)'
                    }}
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Go Back</span>
                </button>

            </div>
        </div>
    );
};

export default NotFound;