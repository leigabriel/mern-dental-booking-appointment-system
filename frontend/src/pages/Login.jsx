import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import authService from "../services/auth.service";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // success or error
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    useEffect(() => {
        // Check for message from registration or email verification
        if (location.state?.message) {
            setMessage(location.state.message);
            setMessageType('success');
        }
    }, [location]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage("");
        setMessageType("");
        setLoading(true);

        try {
            const userData = await authService.login({ identifier, password });
            login(userData);

            // Redirect based on role
            if (userData.role === "admin") {
                navigate("/admin/dashboard");
            } else if (userData.role === "staff") {
                navigate("/staff/dashboard");
            } else {
                navigate("/");
            }
        } catch (error) {
            const resMessage =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();
            setMessage(resMessage);
            setMessageType('error');
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const googleAuthUrl = await authService.getGoogleAuthUrl();
            window.location.href = googleAuthUrl;
        } catch (error) {
            setMessage("Failed to initiate Google login");
        }
    };

    return (
        <div className="relative isolate bg-blue-950 flex justify-center items-center min-h-screen">
            {/* Background Gradient Blobs */}
            <div
                aria-hidden="true"
                className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            >
                <div
                    style={{
                        clipPath:
                            "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                    }}
                    className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                />
            </div>

            {/* Main Container */}
            <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-200 mx-4">
                {/* LEFT PANEL */}
                <div className="relative flex flex-col justify-between text-white p-10 md:w-1/2 rounded-2xl md:rounded-none overflow-hidden">
                    {/* Animated Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-700 to-blue-900 animate-gradient"></div>

                    {/* Background Image Overlay */}
                    <div className="absolute inset-0">
                        <img
                            src="https://i.pinimg.com/736x/4b/a0/03/4ba003d85204accaec805a405947351a.jpg"
                            alt="Dental background"
                            className="w-full h-full object-cover opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-800/80 via-blue-700/70 to-blue-600/60"></div>
                    </div>

                    {/* Content Layer */}
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div>
                            <p className="text-lg opacity-80 font-semibold mb-2">
                                DENTALCARE
                            </p>
                            <h1 className="text-4xl font-extrabold leading-snug">
                                We Care About Your Teeth Health
                            </h1>
                        </div>

                        <div className="mt-10 opacity-80 text-sm">
                            <p className="mb-2 font-medium">Trusted by</p>
                            <div className="flex space-x-4 opacity-90 text-xs">
                                <span className="bg-white/10 px-2 py-1 rounded">Colgate</span>
                                <span className="bg-white/10 px-2 py-1 rounded">Oral-B</span>
                                <span className="bg-white/10 px-2 py-1 rounded">Philips</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL (LOGIN FORM) */}
                <div className="md:w-1/2 w-full p-8 flex flex-col justify-center">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
                        Get Started Now
                    </h1>
                    <p className="text-gray-500 text-sm mb-6">
                        Please log in to your account to continue.
                    </p>

                    {message && (
                        <div className={`p-3 mb-4 rounded-lg border ${
                            messageType === 'success' 
                                ? 'bg-green-100 text-green-700 border-green-300' 
                                : 'bg-red-100 text-red-700 border-red-300'
                        }`}>
                            {message}
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleLogin}>
                        <div>
                            <label
                                htmlFor="identifier"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Email or Username
                            </label>
                            <input
                                type="text"
                                id="identifier"
                                name="identifier"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                                placeholder="Enter email or username"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition pr-10"
                                    placeholder="********"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 hover:text-blue-700 focus:outline-none"
                                >
                                    <img
                                        className="h-5 w-5"
                                        src={
                                            showPassword
                                                ? "https://cdn-icons-png.flaticon.com/128/709/709612.png"
                                                : "https://cdn-icons-png.flaticon.com/128/2767/2767146.png"
                                        }
                                        alt={showPassword ? "Hide Password" : "Show Password"}
                                    />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    required
                                />
                                <span className="text-gray-600">
                                    I agree to the{" "}
                                    <a href="#" className="text-blue-600 hover:underline">
                                        Terms & Privacy
                                    </a>
                                </span>
                            </label>
                            <a href="#" className="text-blue-600 hover:underline font-medium">
                                Forgot Password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-md shadow-blue-300/50 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? "Logging in..." : "Log in"}
                        </button>

                        <div className="text-center text-sm mt-2">
                            Don't have an account?{" "}
                            <Link
                                to="/register"
                                className="text-blue-600 hover:underline font-medium"
                            >
                                Register
                            </Link>
                        </div>

                        <div className="flex items-center my-4">
                            <hr className="flex-grow border-gray-300" />
                            <span className="text-gray-400 text-xs px-2">OR</span>
                            <hr className="flex-grow border-gray-300" />
                        </div>

                        <div className="flex justify-center space-x-3">
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm"
                            >
                                <img
                                    src="https://cdn-icons-png.flaticon.com/128/2991/2991148.png"
                                    className="w-4 h-4"
                                    alt="Google"
                                />
                                <span>Login with Google</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Bottom Background Blob */}
            <div
                aria-hidden="true"
                className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
            >
                <div
                    style={{
                        clipPath:
                            "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                    }}
                    className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[50.1875rem]"
                />
            </div>

            <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 6s ease infinite;
        }
      `}</style>
        </div>
    );
};

export default Login;