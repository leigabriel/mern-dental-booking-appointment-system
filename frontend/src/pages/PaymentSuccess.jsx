import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import paymentService from '../services/payment.service';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';

const PaymentSuccess = () => {
    const { method, appointment_id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [processing, setProcessing] = useState(true);
    const [message, setMessage] = useState('Processing your payment...');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const processPayment = async () => {
            try {
                if (method === 'gcash') {
                    // Process GCash success
                    const response = await paymentService.gcashSuccess(appointment_id);
                    if (response.success) {
                        setSuccess(true);
                        setMessage(response.message);
                    } else {
                        setSuccess(false);
                        setMessage('Failed to process payment. Please contact support.');
                    }
                } else if (method === 'paypal') {
                    // Get token from URL query params
                    const queryParams = new URLSearchParams(location.search);
                    const token = queryParams.get('token');

                    if (!token) {
                        setSuccess(false);
                        setMessage('Payment verification failed. Token not found.');
                        setProcessing(false);
                        return;
                    }

                    // Process PayPal success
                    const response = await paymentService.paypalSuccess(appointment_id, token);
                    if (response.success) {
                        setSuccess(true);
                        setMessage(response.message);
                    } else {
                        setSuccess(false);
                        setMessage('Failed to process payment. Please contact support.');
                    }
                }
            } catch (error) {
                console.error('Payment processing error:', error);
                setSuccess(false);
                setMessage(error.response?.data?.message || 'An error occurred while processing your payment.');
            } finally {
                setProcessing(false);
            }
        };

        processPayment();
    }, [method, appointment_id, location.search]);

    const handleContinue = () => {
        navigate('/profile');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-900 to-purple-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-center">
                    {processing ? (
                        <>
                            <div className="mb-6">
                                <FaSpinner className="w-16 h-16 text-indigo-600 mx-auto animate-spin" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Processing Payment</h2>
                            <p className="text-gray-600">{message}</p>
                        </>
                    ) : success ? (
                        <>
                            <div className="mb-6">
                                <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful!</h2>
                            <p className="text-gray-600 mb-6">{message}</p>
                            <button
                                onClick={handleContinue}
                                className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all duration-200 shadow-lg"
                            >
                                View My Appointments
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="mb-6">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Processing Failed</h2>
                            <p className="text-gray-600 mb-6">{message}</p>
                            <div className="space-y-3">
                                <button
                                    onClick={handleContinue}
                                    className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all duration-200 shadow-lg"
                                >
                                    View My Appointments
                                </button>
                                <button
                                    onClick={() => navigate('/book')}
                                    className="w-full py-3 px-6 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200"
                                >
                                    Book Another Appointment
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
