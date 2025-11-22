import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import authService from '../services/auth.service';

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        verifyEmailToken();
    }, [token]);

    const verifyEmailToken = async () => {
        try {
            const response = await authService.verifyEmailToken(token);
            setStatus('success');
            setMessage(response.message || 'Email verified successfully!');
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login', { 
                    state: { message: 'Email verified! You can now login.' } 
                });
            }, 3000);
        } catch (error) {
            setStatus('error');
            const errorMessage = error.response?.data?.message || 'Invalid or expired verification link.';
            setMessage(errorMessage);
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
            <div className="w-full max-w-md mx-4">
                <div className="bg-white rounded-2xl shadow-2xl border-4 border-gray-200 p-8">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        {status === 'verifying' && (
                            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                                <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        )}
                        {status === 'success' && (
                            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                                <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                                <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
                        {status === 'verifying' && 'Verifying Email'}
                        {status === 'success' && 'Email Verified!'}
                        {status === 'error' && 'Verification Failed'}
                    </h1>

                    {/* Message */}
                    <p className={`text-center mb-6 ${
                        status === 'success' ? 'text-green-600' : 
                        status === 'error' ? 'text-red-600' : 
                        'text-gray-600'
                    }`}>
                        {message}
                    </p>

                    {/* Actions */}
                    {status === 'success' && (
                        <div className="space-y-3">
                            <div className="text-center text-sm text-gray-500">
                                Redirecting to login in 3 seconds...
                            </div>
                            <Link 
                                to="/login" 
                                className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-center hover:bg-blue-700 transition"
                            >
                                Go to Login Now
                            </Link>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-3">
                            <Link 
                                to="/register" 
                                className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-center hover:bg-blue-700 transition"
                            >
                                Register Again
                            </Link>
                            <Link 
                                to="/login" 
                                className="block w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-center hover:bg-gray-300 transition"
                            >
                                Back to Login
                            </Link>
                        </div>
                    )}

                    {status === 'verifying' && (
                        <div className="text-center text-sm text-gray-500">
                            Please wait while we verify your email address...
                        </div>
                    )}
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
        </div>
    );
};

export default VerifyEmail;
