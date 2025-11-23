import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaUser, FaEdit, FaTrash, FaSignOutAlt } from 'react-icons/fa';

const DoctorDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // State
    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState({
        pending: 0,
        confirmed: 0,
        declined: 0,
        completed: 0,
        today: 0
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [declineMessage, setDeclineMessage] = useState('');
    const [profileData, setProfileData] = useState({
        name: '',
        specialty: '',
        email: ''
    });

    useEffect(() => {
        const loadDoctorData = async () => {
            try {
                setLoading(true);
                setMessage({ type: '', text: '' });
                
                console.log('📋 Loading doctor dashboard data...');
                
                // Fetch both data sources in parallel
                await Promise.all([
                    fetchDashboardData(),
                    fetchDoctorProfile()
                ]);
                
                console.log('✅ All doctor data loaded successfully');
                
            } catch (error) {
                console.error('❌ Failed to load doctor data:', error.message);
                setMessage({
                    type: 'error',
                    text: error.message
                });
            } finally {
                setLoading(false);
            }
        };
        
        loadDoctorData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            console.log('=== fetchDashboardData START ===');
            console.log('Fetching appointments for doctor...');

            // Fetch appointments assigned to this doctor
            const appointmentsRes = await api.get('/doctors/my-appointments');
            console.log('Appointments response:', appointmentsRes.data);
            
            const appts = appointmentsRes.data;
            setAppointments(appts);

            // Calculate stats
            const today = new Date().toISOString().split('T')[0];
            const stats = {
                pending: appts.filter(a => a.status === 'pending').length,
                confirmed: appts.filter(a => a.status === 'confirmed').length,
                declined: appts.filter(a => a.status === 'declined').length,
                completed: appts.filter(a => a.status === 'completed').length,
                today: appts.filter(a => a.appointment_date === today).length
            };
            setStats(stats);
            
            console.log('Dashboard stats:', stats);
            console.log('=== fetchDashboardData END ===');
            return true; // Success
        } catch (error) {
            console.error('=== fetchDashboardData ERROR ===');
            console.error('Error:', error);
            console.error('Error response:', error.response);
            console.error('Error status:', error.response?.status);
            console.error('Error data:', error.response?.data);
            
            const errorMessage = error.response?.data?.message || error.message || 'Failed to load dashboard data';
            console.error('================================');
            throw new Error(errorMessage); // Throw to be caught by parent
        }
    };

    const fetchDoctorProfile = async () => {
        try {
            console.log('=== fetchDoctorProfile START ===');
            console.log('Fetching doctor profile...');
            
            const res = await api.get('/doctors/my-profile');
            console.log('Doctor profile response:', res.data);
            
            setProfileData({
                name: res.data.name || '',
                specialty: res.data.specialty || '',
                email: res.data.email || ''
            });
            
            console.log('Profile data set successfully');
            console.log('=== fetchDoctorProfile END ===');
            return true; // Success
        } catch (error) {
            console.error('=== fetchDoctorProfile ERROR ===');
            console.error('Error:', error);
            console.error('Error response:', error.response);
            console.error('Error status:', error.response?.status);
            console.error('Error data:', error.response?.data);
            
            const errorMessage = error.response?.data?.message || error.message;
            console.error('===================================');
            throw new Error(errorMessage); // Throw to be caught by parent
        }
    };

    const handleConfirm = async (appointmentId) => {
        try {
            await api.put(`/doctors/appointments/${appointmentId}/confirm`);
            setMessage({ type: 'success', text: 'Appointment confirmed successfully!' });
            fetchDashboardData();
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            setMessage({ type: 'error', text: `Error: ${errorMessage}` });
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

    const handleDecline = async () => {
        if (!declineMessage.trim()) {
            setMessage({ type: 'error', text: 'Decline message is required' });
            return;
        }

        try {
            await api.put(`/doctors/appointments/${selectedAppointment.id}/decline`, {
                decline_message: declineMessage
            });
            setMessage({ type: 'success', text: 'Appointment declined successfully!' });
            closeDeclineModal();
            fetchDashboardData();
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            setMessage({ type: 'error', text: `Error: ${errorMessage}` });
        }
    };

    const openEditProfileModal = () => {
        setShowEditProfileModal(true);
    };

    const closeEditProfileModal = () => {
        setShowEditProfileModal(false);
        fetchDoctorProfile(); // Reset to current data
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        try {
            await api.put('/doctors/my-profile', profileData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            closeEditProfileModal();
            fetchDoctorProfile();
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            setMessage({ type: 'error', text: `Error: ${errorMessage}` });
        }
    };

    const openDeleteAccountModal = () => {
        setShowDeleteAccountModal(true);
    };

    const closeDeleteAccountModal = () => {
        setShowDeleteAccountModal(false);
    };

    const handleDeleteAccount = async () => {
        try {
            await api.delete('/doctors/my-profile');
            setMessage({ type: 'success', text: 'Account deleted successfully. Logging out...' });
            setTimeout(() => {
                logout();
                navigate('/login');
            }, 2000);
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            setMessage({ type: 'error', text: `Error: ${errorMessage}` });
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-green-100 text-green-800',
            declined: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800',
            completed: 'bg-blue-100 text-blue-800'
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-xl">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
                            <p className="text-gray-600 mt-1">Welcome Doctor</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={openEditProfileModal}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                            >
                                <FaEdit /> Edit Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
                            >
                                <FaSignOutAlt /> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Alert Messages */}
                {message.text && (
                    <div className={`p-4 mb-6 rounded-lg border shadow-sm ${message.type === 'success' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
                        <strong className="font-bold">{message.type === 'success' ? 'Success!' : 'Error!'}</strong>
                        <span className="ml-2">{message.text}</span>
                    </div>
                )}

                {/* Stats Cards */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
                    {/* Pending */}
                    <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-600 font-medium">Pending</p>
                                <p className="text-3xl font-bold text-yellow-700 mt-1">{stats.pending}</p>
                            </div>
                            <FaClock className="text-3xl text-yellow-400" />
                        </div>
                    </div>

                    {/* Confirmed */}
                    <div className="bg-green-50 p-6 rounded-lg border border-green-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600 font-medium">Confirmed</p>
                                <p className="text-3xl font-bold text-green-700 mt-1">{stats.confirmed}</p>
                            </div>
                            <FaCheckCircle className="text-3xl text-green-400" />
                        </div>
                    </div>

                    {/* Declined */}
                    <div className="bg-red-50 p-6 rounded-lg border border-red-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-600 font-medium">Declined</p>
                                <p className="text-3xl font-bold text-red-700 mt-1">{stats.declined}</p>
                            </div>
                            <FaTimesCircle className="text-3xl text-red-400" />
                        </div>
                    </div>

                    {/* Completed */}
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600 font-medium">Completed</p>
                                <p className="text-3xl font-bold text-blue-700 mt-1">{stats.completed}</p>
                            </div>
                            <FaCheckCircle className="text-3xl text-blue-400" />
                        </div>
                    </div>

                    {/* Today */}
                    <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-600 font-medium">Today</p>
                                <p className="text-3xl font-bold text-purple-700 mt-1">{stats.today}</p>
                            </div>
                            <FaCalendarAlt className="text-3xl text-purple-400" />
                        </div>
                    </div>
                </section>

                {/* Appointments Table */}
                <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">My Appointments</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {appointments.length > 0 ? (
                                    appointments.map((apt) => (
                                        <tr key={apt.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4 text-sm font-medium text-gray-900">{apt.id}</td>
                                            <td className="px-4 py-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <FaUser className="text-gray-400" />
                                                    {apt.patient_name || apt.patient_first_name || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-600">{apt.service_name || 'N/A'}</td>
                                            <td className="px-4 py-4 text-sm text-gray-600">{formatDate(apt.appointment_date)}</td>
                                            <td className="px-4 py-4 text-sm text-gray-600">{apt.appointment_time || apt.time_slot}</td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(apt.status)}`}>
                                                    {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm space-x-2">
                                                {apt.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleConfirm(apt.id)}
                                                            className="text-green-600 hover:text-green-800 font-medium"
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() => openDeclineModal(apt)}
                                                            className="text-red-600 hover:text-red-800 font-medium"
                                                        >
                                                            Decline
                                                        </button>
                                                    </>
                                                )}
                                                {apt.status !== 'pending' && (
                                                    <span className="text-gray-400 text-xs italic">No actions</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                            No appointments found. Patients will see you when they book appointments.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Account Management */}
                <section className="mt-8 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Account Management</h2>
                    <div className="flex gap-4">
                        <button
                            onClick={openDeleteAccountModal}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                        >
                            <FaTrash /> Delete My Account
                        </button>
                    </div>
                </section>
            </main>

            {/* Decline Modal */}
            {showDeclineModal && selectedAppointment && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) closeDeclineModal(); }}>
                    <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Decline Appointment</h3>
                        <p className="text-gray-600 mb-4">
                            You are declining appointment #{selectedAppointment.id} for <strong>{selectedAppointment.patient_name || selectedAppointment.patient_first_name}</strong>.
                        </p>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for declining <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={declineMessage}
                                onChange={(e) => setDeclineMessage(e.target.value)}
                                placeholder="Enter the reason for declining this appointment..."
                                rows="4"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 resize-none"
                            />
                        </div>
                        <div className="flex justify-end gap-4">
                            <button type="button" onClick={closeDeclineModal} className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium">
                                Cancel
                            </button>
                            <button onClick={handleDecline} className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-md">
                                Decline Appointment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Profile Modal */}
            {showEditProfileModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) closeEditProfileModal(); }}>
                    <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Edit Profile</h3>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                                <input
                                    type="text"
                                    value={profileData.specialty}
                                    onChange={(e) => setProfileData({ ...profileData, specialty: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={closeEditProfileModal} className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium">
                                    Cancel
                                </button>
                                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-md">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Account Modal */}
            {showDeleteAccountModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) closeDeleteAccountModal(); }}>
                    <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="mb-4 text-red-500 text-5xl">⚠️</div>
                            <h3 className="text-2xl font-semibold text-gray-800">Delete Account</h3>
                        </div>
                        <p className="text-gray-600 text-center mb-6">
                            Are you sure you want to delete your doctor account? This action cannot be undone and will remove all your data.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button type="button" onClick={closeDeleteAccountModal} className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium">
                                Cancel
                            </button>
                            <button onClick={handleDeleteAccount} className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-md">
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;
