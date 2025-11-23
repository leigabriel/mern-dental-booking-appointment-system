import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import api from '../services/api';
import { FaUsers, FaUserMd, FaCalendarAlt, FaBan, FaCheckCircle, FaClock, FaDollarSign, FaCalendarDay } from 'react-icons/fa';

const StaffDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // State
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalDoctors: 0,
        totalAppointments: 0,
        suspendedUsers: 0,
        pendingAppointments: 0,
        confirmedAppointments: 0,
        todayAppointments: 0,
        paidAppointments: 0,
        unpaidAppointments: 0
    });
    const [users, setUsers] = useState([]);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [suspensionReason, setSuspensionReason] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(true);

    // Fetch dashboard data
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setMessage({ type: '', text: '' });
            
            console.log('Fetching dashboard stats...');
            const statsRes = await api.get('/admin/stats');
            console.log('Stats response:', statsRes.data);
            setStats(statsRes.data);

            console.log('Fetching users...');
            const usersRes = await api.get('/admin/users');
            console.log('Users response:', usersRes.data);
            
            // Filter to show only users and doctors (not admin/staff)
            const filteredUsers = usersRes.data.filter(u => u.role === 'user' || u.role === 'doctor');
            setUsers(filteredUsers);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            // Handle permission errors specifically
            if (error.response?.status === 403) {
                setMessage({ 
                    type: 'error', 
                    text: 'Access Denied: You do not have permission to view this data. Please contact your administrator.' 
                });
            } else {
                const errorMessage = error.response?.data?.message 
                    || error.response?.statusText 
                    || error.message 
                    || 'Failed to load dashboard data';
                
                setMessage({ 
                    type: 'error', 
                    text: `Dashboard Error: ${errorMessage}` 
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const openSuspendModal = (userData) => {
        setSelectedUser(userData);
        setSuspensionReason('');
        setShowSuspendModal(true);
    };

    const closeSuspendModal = () => {
        setShowSuspendModal(false);
        setSelectedUser(null);
        setSuspensionReason('');
    };

    const handleSuspend = async () => {
        if (!suspensionReason.trim()) {
            setMessage({ type: 'error', text: 'Suspension reason is required' });
            return;
        }

        try {
            await api.put(`/admin/users/${selectedUser.id}/suspend`, {
                suspension_reason: suspensionReason
            });
            setMessage({ type: 'success', text: 'User suspended successfully!' });
            closeSuspendModal();
            fetchDashboardData();
        } catch (error) {
            const resMessage = error.response?.data?.message || error.message;
            setMessage({ type: 'error', text: resMessage });
        }
    };

    const handleUnsuspend = async (userId) => {
        try {
            await api.put(`/admin/users/${userId}/unsuspend`);
            setMessage({ type: 'success', text: 'User unsuspended successfully!' });
            fetchDashboardData();
        } catch (error) {
            const resMessage = error.response?.data?.message || error.message;
            setMessage({ type: 'error', text: resMessage });
        }
    };

    const getRoleBadgeClass = (role) => {
        const classes = {
            doctor: 'bg-teal-100 text-teal-800',
            user: 'bg-gray-100 text-gray-800'
        };
        return classes[role] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-xl">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <AdminSidebar currentPage="dashboard" userRole={user?.role} />

            <div className="flex-1 flex flex-col lg:flex-row">
                {/* Main Content */}
                <main className="flex-1 p-6 sm:p-10 overflow-y-auto h-screen">
                    <header className="mb-10">
                        <h1 className="text-8xl font-extrabold text-gray-900">Staff Dashboard</h1>
                        <p className="text-lg text-gray-600 mt-1">Welcome back, {user?.full_name}. Here's a summary of the clinic.</p>
                    </header>

                    {/* Alert Messages */}
                    {message.text && (
                        <div className={`p-4 mb-6 rounded-lg border shadow-sm ${message.type === 'success' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
                            <strong className="font-bold">{message.type === 'success' ? 'Success!' : 'Error!'}</strong>
                            <span className="ml-2">{message.text}</span>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
{/* Total Patients Card */}
                        <div className="flex min-h-[20em] flex-col justify-between gap-[0.5em] rounded-[1.5em] bg-[#E0F2FE] p-[1.5em] text-[#0369A1] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.1)] transition hover:shadow-lg">
                            <div className="flex h-fit w-full items-start justify-between">
                                <div className="flex flex-col items-start justify-center">
                                    <p className="text-[1rem] font-semibold uppercase tracking-wider">Total Patients</p>
                                    <p className="text-[8em] font-extrabold mt-1">{stats.totalUsers}</p>
                                </div>
                                <div className="text-4xl opacity-80">
                                    <FaUsers />
                                </div>
                            </div>
                            <div className="h-[1px] w-full rounded-full bg-[hsla(206,90%,50%,0.2)]"></div>
                            <p className="text-[0.75rem] font-light text-sky-600">All registered patient accounts.</p>
                        </div>

                        {/* Total Staff Card */}
                        <div className="flex min-h-[20em] flex-col justify-between gap-[0.5em] rounded-[1.5em] bg-[#D1FAE5] p-[1.5em] text-[#047857] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.1)] transition hover:shadow-lg">
                            <div className="flex h-fit w-full items-start justify-between">
                                <div className="flex flex-col items-start justify-center">
                                    <p className="text-[1rem] font-semibold uppercase tracking-wider">Total Staff</p>
                                    <p className="text-[8em] font-extrabold mt-1">{stats.totalStaff}</p>
                                </div>
                                <div className="text-4xl opacity-80">
                                    <FaUserMd />
                                </div>
                            </div>
                            <div className="h-[1px] w-full rounded-full bg-[hsla(158,90%,40%,0.2)]"></div>
                            <p className="text-[0.75rem] font-light text-emerald-600">All registered staff accounts.</p>
                        </div>

                        {/* Total Doctors Card */}
                        <div className="flex min-h-[20em] flex-col justify-between gap-[0.5em] rounded-[1.5em] bg-[#FEF3C7] p-[1.5em] text-[#B45309] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.1)] transition hover:shadow-lg">
                            <div className="flex h-fit w-full items-start justify-between">
                                <div className="flex flex-col items-start justify-center">
                                    <p className="text-[1rem] font-semibold uppercase tracking-wider">Total Doctors</p>
                                    <p className="text-[8em] font-extrabold mt-1">{stats.totalDoctors}</p>
                                </div>
                                <div className="text-4xl opacity-80">
                                    <FaCalendarAlt />
                                </div>
                            </div>
                            <div className="h-[1px] w-full rounded-full bg-[hsla(39,90%,40%,0.2)]"></div>
                            <p className="text-[0.75rem] font-light text-amber-700">All Doctor records.</p>
                        </div>

                        {/* Total Bookings Card */}
                        <div className="flex min-h-[20em] flex-col justify-between gap-[0.5em] rounded-[1.5em] bg-[#FEF3C7] p-[1.5em] text-[#B45309] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.1)] transition hover:shadow-lg">
                            <div className="flex h-fit w-full items-start justify-between">
                                <div className="flex flex-col items-start justify-center">
                                    <p className="text-[1rem] font-semibold uppercase tracking-wider">Total Bookings</p>
                                    <p className="text-[8em] font-extrabold mt-1">{stats.totalAppointments}</p>
                                </div>
                                <div className="text-4xl opacity-80">
                                    <FaCalendarAlt />
                                </div>
                            </div>
                            <div className="h-[1px] w-full rounded-full bg-[hsla(39,90%,40%,0.2)]"></div>
                            <p className="text-[0.75rem] font-light text-amber-700">All appointment records.</p>
                        </div>
                    </section>

                    {/* Additional Stats Cards */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-10">
                        {/* Suspended Users */}
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-red-600 font-medium">Suspended</p>
                                    <p className="text-3xl font-bold text-red-700 mt-1">{stats.suspendedUsers}</p>
                                </div>
                                <FaBan className="text-2xl text-red-400" />
                            </div>
                        </div>

                        {/* Pending Appointments */}
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-yellow-600 font-medium">Pending</p>
                                    <p className="text-3xl font-bold text-yellow-700 mt-1">{stats.pendingAppointments}</p>
                                </div>
                                <FaClock className="text-2xl text-yellow-400" />
                            </div>
                        </div>

                        {/* Confirmed Appointments */}
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-600 font-medium">Confirmed</p>
                                    <p className="text-3xl font-bold text-green-700 mt-1">{stats.confirmedAppointments}</p>
                                </div>
                                <FaCheckCircle className="text-2xl text-green-400" />
                            </div>
                        </div>

                        {/* Today's Appointments */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-600 font-medium">Today</p>
                                    <p className="text-3xl font-bold text-blue-700 mt-1">{stats.todayAppointments}</p>
                                </div>
                                <FaCalendarDay className="text-2xl text-blue-400" />
                            </div>
                        </div>

                        {/* Paid Appointments */}
                        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-emerald-600 font-medium">Paid</p>
                                    <p className="text-3xl font-bold text-emerald-700 mt-1">{stats.paidAppointments}</p>
                                </div>
                                <FaDollarSign className="text-2xl text-emerald-400" />
                            </div>
                        </div>

                        {/* Unpaid Appointments */}
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-orange-600 font-medium">Unpaid</p>
                                    <p className="text-3xl font-bold text-orange-700 mt-1">{stats.unpaidAppointments}</p>
                                </div>
                                <FaDollarSign className="text-2xl text-orange-400" />
                            </div>
                        </div>
                    </section>

                    {/* Users Table */}
                    <section className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">Users & Doctors</h2>
                            <p className="text-gray-600 mt-1">Manage patient and doctor accounts</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((userData) => (
                                        <tr key={userData.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{userData.full_name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-gray-900">{userData.username}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-gray-900">{userData.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeClass(userData.role)}`}>
                                                    {userData.role.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${userData.is_suspended ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                    {userData.is_suspended ? 'Suspended' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {!userData.is_suspended ? (
                                                    <button
                                                        onClick={() => openSuspendModal(userData)}
                                                        className="text-red-500 px-4 py-2 rounded-lg  transition-colors"
                                                    >
                                                        Suspend
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleUnsuspend(userData.id)}
                                                        className="text-green-500 px-4 py-2 rounded-lg transition-colors"
                                                    >
                                                        Unsuspend
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>
            </div>

            {/* Suspend Modal */}
            {showSuspendModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Suspend User</h3>
                        <p className="text-gray-600 mb-4">
                            You are about to suspend <strong>{selectedUser?.full_name}</strong>. 
                            Please provide a reason for suspension.
                        </p>
                        <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                            rows="4"
                            placeholder="Enter suspension reason..."
                            value={suspensionReason}
                            onChange={(e) => setSuspensionReason(e.target.value)}
                        />
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeSuspendModal}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSuspend}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Suspend User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffDashboard;