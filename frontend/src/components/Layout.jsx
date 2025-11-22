import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FaTooth } from "react-icons/fa";

const Layout = ({ children }) => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-blue-600 text-white shadow-lg">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="text-2xl font-bold flex items-center gap-2">
                            <FaTooth className="text-2xl" />
                            DentalCare
                        </Link>

                        <div className="flex items-center space-x-4">
                            {user ? (
                                <>
                                    <Link to="/book" className="hover:text-blue-200">
                                        Book Appointment
                                    </Link>
                                    <Link to="/profile" className="hover:text-blue-200">
                                        Profile
                                    </Link>
                                    {user.role === "admin" && (
                                        <Link to="/admin/dashboard" className="hover:text-blue-200">
                                            Admin
                                        </Link>
                                    )}
                                    {(user.role === "staff" || user.role === "admin") && (
                                        <Link to="/staff/dashboard" className="hover:text-blue-200">
                                            Staff
                                        </Link>
                                    )}
                                    <button
                                        onClick={logout}
                                        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="hover:text-blue-200">
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-50"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main>{children}</main>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8 mt-12">
                <div className="container mx-auto px-4 text-center">
                    <p>&copy; 2025 DentalCare System. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
