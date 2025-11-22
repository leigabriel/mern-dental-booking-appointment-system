import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import paymentService from '../services/payment.service';
import { FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

const PaymentFailed = () => {
    const { method, appointment_id } = useParams();
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(true);
    const [message, setMessage] = useState('Processing payment cancellation...');

    useEffect(() => {
        const processFailure = async () => {
            try {
                if (method === 'gcash') {
                    const response = await paymentService.gcashFailed(appointment_id);
                    setMessage(response.message);
                } else if (method === 'paypal') {
                    const response = await paymentService.paypalCancel(appointment_id);
                    setMessage(response.message);
                }
            } catch (error) {
                console.error('Payment failure processing error:', error);
                setMessage(error.response?.data?.message || 'An error occurred while processing your payment cancellation.');
            } finally {
                setProcessing(false);
            }
        };

        processFailure();
    }, [method, appointment_id]);

    const handleRetry = () => {
        navigate('/profile');
    };

    const handleBookNew = () => {
        navigate('/book');
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
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Processing</h2>
                            <p className="text-gray-600">{message}</p>
                        </>
                    ) : (
                        <>
                            <div className="mb-6">
                                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                                    <FaExclamationTriangle className="w-8 h-8 text-yellow-600" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Cancelled</h2>
                            <p className="text-gray-600 mb-6">{message}</p>
                            <div className="space-y-3">
                                <button
                                    onClick={handleRetry}
                                    className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all duration-200 shadow-lg"
                                >
                                    View My Appointments
                                </button>
                                <button
                                    onClick={handleBookNew}
                                    className="w-full py-3 px-6 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200"
                                >
                                    Book New Appointment
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentFailed;
