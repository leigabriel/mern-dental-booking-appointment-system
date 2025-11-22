import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/auth.service';

const Register = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('user');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage('');
        setErrors([]);
        setLoading(true);

        // Validation
        const validationErrors = [];

        if (!name.trim()) validationErrors.push('Full name is required');
        if (!username.trim()) validationErrors.push('Username is required');
        if (username && username.length < 3) {
            validationErrors.push('Username must be at least 3 characters long');
        }
        if (!email.trim()) validationErrors.push('Email is required');
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            validationErrors.push('Please enter a valid email address');
        }
        if (!password) validationErrors.push('Password is required');
        if (password && password.length < 6) {
            validationErrors.push('Password must be at least 6 characters long');
        }
        if (password !== confirmPassword) {
            validationErrors.push('Passwords do not match');
        }

        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            setLoading(false);
            return;
        }

        try {
            await authService.register({
                name,
                username,
                email,
                password,
                role,
            });

            navigate('/login', { state: { message: 'Registration successful! Please check your email to verify your account before logging in.' } });
        } catch (error) {
            const resMessage =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();
            setErrors([resMessage]);
            setLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        try {
            const googleAuthUrl = await authService.getGoogleAuthUrl();
            window.location.href = googleAuthUrl;
        } catch (error) {
            setErrors(['Failed to initiate Google registration']);
        }
    };

    return (
        <div className="relative isolate bg-blue-950 flex justify-center items-center min-h-screen py-8">
            {/* Background Gradient Blobs */}
            <div aria-hidden="true" className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                <div
                    style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }}
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
                            <p className="text-lg font-semibold opacity-80 mb-2">Your smile, our priority</p>
                            <h1 className="text-4xl font-extrabold leading-snug">Join the DENTALCARE<br />community today</h1>
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

                {/* RIGHT PANEL (REGISTER FORM) */}
                <div className="md:w-1/2 w-full p-8 flex flex-col justify-center">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Create your Account</h1>
                    <p className="text-gray-500 text-sm mb-6">Register to access our dental booking and care services.</p>

                    {/* Error Display */}
                    {errors.length > 0 && (
                        <div className="p-3 mb-4 rounded-lg bg-red-100 text-red-700 border border-red-300">
                            <ul className="list-disc pl-5 m-0">
                                {errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleRegister}>
                        {/* Full Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                                placeholder="Enter your full name"
                            />
                        </div>

                        {/* Username */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                                placeholder="Choose a unique username"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                                placeholder="user@example.com"
                            />
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                Select Role
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                            >
                                <option value="user">User</option>
                                <option value="doctor">Doctor</option>
                                <option value="staff">Staff</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
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
                                        src={showPassword
                                            ? "https://cdn-icons-png.flaticon.com/128/709/709612.png"
                                            : "https://cdn-icons-png.flaticon.com/128/2767/2767146.png"
                                        }
                                        alt={showPassword ? "Hide Password" : "Show Password"}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition pr-10"
                                    placeholder="********"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 hover:text-blue-700 focus:outline-none"
                                >
                                    <img
                                        className="h-5 w-5"
                                        src={showConfirmPassword
                                            ? "https://cdn-icons-png.flaticon.com/128/709/709612.png"
                                            : "https://cdn-icons-png.flaticon.com/128/2767/2767146.png"
                                        }
                                        alt={showConfirmPassword ? "Hide Password" : "Show Password"}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-md shadow-blue-300/50 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating account...' : 'Register'}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="text-center mt-6 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 hover:underline font-medium transition">
                            Login
                        </Link>
                    </div>

                    {/* OR Divider */}
                    <div className="flex items-center my-4">
                        <hr className="flex-grow border-gray-300" />
                        <span className="text-gray-400 text-xs px-2">OR</span>
                        <hr className="flex-grow border-gray-300" />
                    </div>

                    {/* Google Login */}
                    <div className="flex justify-center space-x-3">
                        <button
                            type="button"
                            onClick={handleGoogleRegister}
                            className="flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm"
                        >
                            <img src="https://cdn-icons-png.flaticon.com/128/2991/2991148.png" className="w-4 h-4" alt="Google" />
                            <span>Sign up with Google</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Background Blob */}
            <div aria-hidden="true" className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
                <div
                    style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }}
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

export default Register;