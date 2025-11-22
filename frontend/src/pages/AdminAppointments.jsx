import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import api from '../services/api';
import { FaShieldAlt } from 'react-icons/fa';

const AdminAppointments = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // State
    const [appointments, setAppointments] = useState([]);
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [declineMessage, setDeclineMessage] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(true);

    // Fetch appointments
    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/appointments/all');
            setAppointments(response.data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setMessage({ type: 'error', text: 'Failed to load appointments' });
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (appointmentId) => {
        try {
            await api.put(`/appointments/${appointmentId}/confirm`);
            setMessage({ type: 'success', text: 'Appointment confirmed successfully!' });
            fetchAppointments();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to confirm appointment' });
        }
    };

    const handleCancel = async (appointmentId) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

        try {
            await api.put(`/appointments/${appointmentId}/cancel`);
            setMessage({ type: 'success', text: 'Appointment cancelled successfully!' });
            fetchAppointments();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to cancel appointment' });
        }
    };

    const openDeclineModal = (appointment) => {
        setSelectedAppointment(appointment);
        setDeclineMessage('');
        setShowDeclineModal(true);
    };

    const closeDeclineModal = () => {
        setShowDeclineModal(false);
        setSelectedAppointment(null);
        setDeclineMessage('');
    };

    const handleDecline = async (e) => {
        e.preventDefault();
        if (!declineMessage.trim()) {
            alert('Please provide a decline reason');
            return;
        }

        try {
            await api.put(`/appointments/${selectedAppointment.id}/decline`, {
                decline_message: declineMessage
            });
            setMessage({ type: 'success', text: 'Appointment declined successfully!' });
            closeDeclineModal();
            fetchAppointments();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to decline appointment' });
        }
    };

    const openMarkPaidModal = (appointment) => {
        setSelectedAppointment(appointment);
        setShowMarkPaidModal(true);
    };

    const closeMarkPaidModal = () => {
        setShowMarkPaidModal(false);
        setSelectedAppointment(null);
    };

    const handleMarkAsPaid = async () => {
        try {
            await api.put(`/appointments/${selectedAppointment.id}/mark-paid`);
            setMessage({ type: 'success', text: 'Payment marked as paid successfully!' });
            closeMarkPaidModal();
            fetchAppointments();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to mark payment as paid' });
        }
    };

    const getStatusBadgeClass = (status) => {
        const classes = {
            confirmed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            declined: 'bg-orange-100 text-orange-800',
            pending: 'bg-yellow-100 text-yellow-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-xl">Loading appointments...</div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <AdminSidebar currentPage="appointments" userRole={user?.role} />

            <div className="flex-1 flex flex-col lg:flex-row">
                {/* Main Content */}
                <main className="flex-1 p-6 sm:p-10 overflow-y-auto h-screen">
                    <header className="mb-10">
                        <h1 className="text-8xl font-extrabold text-gray-900">Manage Appointments</h1>
                        <p className="text-lg text-gray-600 mt-1">View, confirm, and cancel patient bookings.</p>
                    </header>

                    {/* Alert Messages */}
                    {message.text && (
                        <div className={`p-4 mb-6 rounded-lg border shadow-sm ${message.type === 'success' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
                            <strong className="font-bold">{message.type === 'success' ? 'Success!' : 'Error!'}</strong>
                            <span className="ml-2">{message.text}</span>
                        </div>
                    )}

                    {/* Appointments Table */}
                    <section className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {appointments.length > 0 ? (
                                        appointments.map((app) => (
                                            <tr key={app.id} className="hover:bg-gray-50">
                                                <td className="px-3 py-4 text-sm font-medium text-gray-900">{app.id}</td>
                                                <td className="px-3 py-4 text-sm text-gray-600">{app.patient_name || 'N/A'}</td>
                                                <td className="px-3 py-4 text-sm text-gray-600">{app.doctor_name || 'N/A'}</td>
                                                <td className="px-3 py-4 text-sm text-gray-600">
                                                    <div className="font-medium">{app.service_name || 'N/A'}</div>
                                                    {app.service_price && (
                                                        <div className="text-xs text-green-600 font-bold">₱{Number(app.service_price).toFixed(2)}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-4 text-sm text-gray-600">
                                                    <div>{formatDate(app.appointment_date)}</div>
                                                    <div className="text-xs text-gray-500">{app.time_slot}</div>
                                                </td>
                                                <td className="px-3 py-4 text-sm">
                                                    {/* Payment Method Badge */}
                                                    {app.payment_method === 'gcash' && (
                                                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-semibold mb-1">
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                                                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                                                            </svg>
                                                            GCash
                                                        </div>
                                                    )}
                                                    {app.payment_method === 'paypal' && (
                                                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 rounded-md text-xs font-semibold mb-1">
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                            </svg>
                                                            PayPal
                                                        </div>
                                                    )}
                                                    {app.payment_method === 'clinic' && (
                                                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs font-semibold mb-1">
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                            </svg>
                                                            At Clinic
                                                        </div>
                                                    )}

                                                    {/* Payment Status Badge */}
                                                    {app.payment_status === 'paid' && (
                                                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            Paid
                                                        </div>
                                                    )}
                                                    {app.payment_status === 'unpaid' && (
                                                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                            </svg>
                                                            Unpaid
                                                        </div>
                                                    )}
                                                    {app.payment_status === 'pending' && (
                                                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                            </svg>
                                                            Pending
                                                        </div>
                                                    )}

                                                    {/* Mark as Paid Button */}
                                                    {app.payment_method === 'clinic' && app.payment_status !== 'paid' && app.status !== 'cancelled' && (
                                                        <div className="mt-2">
                                                            <button onClick={() => openMarkPaidModal(app)} className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold transition-colors">
                                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                                Mark as Paid
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-4">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(app.status)}`}>
                                                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                                    </span>
                                                    {app.status === 'declined' && app.decline_message && (
                                                        <div className="mt-2 text-xs text-gray-600 bg-orange-50 p-2 rounded border border-orange-200">
                                                            <span className="font-semibold text-orange-700">Reason: </span>
                                                            <span>{app.decline_message}</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-4 text-sm space-x-2 whitespace-nowrap">
                                                    {app.status === 'pending' && (
                                                        <>
                                                            <button onClick={() => handleConfirm(app.id)} className="text-green-600 hover:text-green-800 font-medium">Confirm</button>
                                                            <button onClick={() => openDeclineModal(app)} className="text-orange-600 hover:text-orange-800 font-medium">Decline</button>
                                                        </>
                                                    )}
                                                    {app.status === 'confirmed' && (
                                                        <>
                                                            <button onClick={() => openDeclineModal(app)} className="text-orange-600 hover:text-orange-800 font-medium">Decline</button>
                                                        </>
                                                    )}
                                                    {app.status === 'declined' && (
                                                        <span className="text-sm text-gray-600">Declined</span>
                                                    )}
                                                    {(app.status === 'cancelled' || (!['pending', 'confirmed', 'declined'].includes(app.status))) && (
                                                        <span className="text-gray-400">N/A</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="px-3 py-4 text-center text-gray-500">No appointments found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>
            </div>

            {/* Decline Modal */}
            {showDeclineModal && selectedAppointment && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) closeDeclineModal(); }}>
                    <div className="bg-white w-full max-w-xl p-6 rounded-2xl shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-3">Decline Appointment</h3>
                        <p className="text-sm text-gray-600 mb-4">Provide a short reason for declining this appointment. This message will be visible to the patient in their profile.</p>
                        <form onSubmit={handleDecline}>
                            <div className="mb-3">
                                <label htmlFor="decline_message" className="block text-sm font-medium text-gray-700">Message</label>
                                <textarea
                                    id="decline_message"
                                    value={declineMessage}
                                    onChange={(e) => setDeclineMessage(e.target.value)}
                                    rows="4"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-600 focus:border-blue-600 px-3 py-2 border"
                                    placeholder="Enter decline reason..."
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={closeDeclineModal} className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">Send & Decline</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Mark as Paid Modal */}
            {showMarkPaidModal && selectedAppointment && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) closeMarkPaidModal(); }}>
                    <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Mark Payment as Paid</h3>
                                <p className="text-sm text-gray-600">Confirm clinic payment received</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-6">
                            Are you sure you want to mark this appointment payment as <span className="font-semibold text-emerald-600">PAID</span>?
                            <br />
                            <span className="text-xs text-gray-500 mt-1 block">Patient: <span className="font-medium text-gray-700">{selectedAppointment.patient_name}</span></span>
                        </p>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={closeMarkPaidModal} className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleMarkAsPaid} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium transition-colors inline-flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Confirm Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAppointments;
