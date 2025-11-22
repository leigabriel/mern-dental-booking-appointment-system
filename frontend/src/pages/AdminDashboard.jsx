import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import api from '../services/api';
import { FaUsers, FaUserMd, FaShieldAlt, FaCalendarAlt, FaPlus, FaBan, FaCheckCircle, FaClock, FaDollarSign, FaCalendarDay } from 'react-icons/fa';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // State
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStaff: 0,
        totalAdmins: 0,
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
    const [showUserModal, setShowUserModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [suspensionReason, setSuspensionReason] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalMode, setModalMode] = useState('add');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        full_name: '',
        username: '',
        email: '',
        password: '',
        role: 'staff'
    });
    const [errors, setErrors] = useState([]);
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
            
            setUsers(usersRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            const errorMessage = error.response?.data?.message 
                || error.response?.statusText 
                || error.message 
                || 'Failed to load dashboard data';
            
            setMessage({ 
                type: 'error', 
                text: `Dashboard Error: ${errorMessage}` 
            });
        } finally {
            setLoading(false);
        }
    };

    const openModal = (mode, userData = null) => {
        setModalMode(mode);
        setErrors([]);
        if (mode === 'edit' && userData) {
            setSelectedUser(userData);
            setFormData({
                full_name: userData.full_name || '',
                username: userData.username || userData.email.split('@')[0] || '',
                email: userData.email || '',
                password: '',
                role: userData.role || 'staff'
            });
        } else {
            setSelectedUser(null);
            setFormData({
                full_name: '',
                username: '',
                email: '',
                password: '',
                role: 'staff'
            });
        }
        setShowUserModal(true);
    };

    const closeModal = () => {
        setShowUserModal(false);
        setSelectedUser(null);
        setFormData({
            full_name: '',
            username: '',
            email: '',
            password: '',
            role: 'staff'
        });
        setErrors([]);
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);

        // Validation
        const validationErrors = [];
        if (!formData.full_name.trim()) validationErrors.push('Full name is required');
        if (!formData.username.trim()) validationErrors.push('Username is required');
        if (!formData.email.trim()) validationErrors.push('Email is required');
        if (modalMode === 'add' && !formData.password) validationErrors.push('Password is required');
        if (formData.password && formData.password.length < 6) validationErrors.push('Password must be at least 6 characters');

        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            if (modalMode === 'add') {
                const apiData = {
                    full_name: formData.full_name.trim(),
                    username: formData.username.trim(),
                    email: formData.email,
                    password: formData.password,
                    role: formData.role
                };
                await api.post('/admin/staff', apiData);
                setMessage({ type: 'success', text: 'User created successfully!' });
            } else {
                const updateData = {
                    full_name: formData.full_name.trim(),
                    username: formData.username.trim(),
                    email: formData.email,
                    role: formData.role
                };
                if (formData.password) {
                    updateData.password = formData.password;
                }
                await api.put(`/admin/staff/${selectedUser.id}`, updateData);
                setMessage({ type: 'success', text: 'User updated successfully!' });
            }
            closeModal();
            fetchDashboardData();
        } catch (error) {
            const resMessage = error.response?.data?.message || error.message;
            setErrors([resMessage]);
        }
    };

    const handleDelete = async (userId) => {
        try {
            await api.delete(`/admin/staff/${userId}`);
            setMessage({ type: 'success', text: 'User deleted successfully!' });
            setShowDeleteModal(false);
            setSelectedUser(null);
            fetchDashboardData();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete user' });
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
            admin: 'bg-blue-100 text-blue-800',
            staff: 'bg-sky-100 text-sky-800',
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
                        <h1 className="text-8xl font-extrabold text-gray-900">Dashboard</h1>
                        <p className="text-lg text-gray-600 mt-1">Welcome back, {user?.first_name} {user?.last_name}. Here's a summary of your clinic.</p>
                    </header>

                    {/* Alert Messages */}
                    {message.text && (
                        <div className={`p-4 mb-6 rounded-lg border shadow-sm ${message.type === 'success' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
                            <strong className="font-bold">{message.type === 'success' ? 'Success!' : 'Error!'}</strong>
                            <span className="ml-2">{message.text}</span>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 mb-10">
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

                        {/* Total Admins Card */}
                        <div className="flex min-h-[20em] flex-col justify-between gap-[0.5em] rounded-[1.5em] bg-[#EDE9FE] p-[1.5em] text-[#5B21B6] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.1)] transition hover:shadow-lg">
                            <div className="flex h-fit w-full items-start justify-between">
                                <div className="flex flex-col items-start justify-center">
                                    <p className="text-[1rem] font-semibold uppercase tracking-wider">Total Admins</p>
                                    <p className="text-[8em] font-extrabold mt-1">{stats.totalAdmins}</p>
                                </div>
                                <div className="text-4xl opacity-80">
                                    <FaShieldAlt />
                                </div>
                            </div>
                            <div className="h-[1px] w-full rounded-full bg-[hsla(263,90%,50%,0.2)]"></div>
                            <p className="text-[0.75rem] font-light text-violet-600">All registered admin accounts.</p>
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

                    {/* User Accounts Table */}
                    <section className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">User Accounts</h2>
                            {user?.role === 'admin' && (
                                <button type="button" onClick={() => openModal('add')} className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center gap-2">
                                    <FaPlus /> Add Admin/Staff
                                </button>
                            )}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.length > 0 ? (
                                        users.map((u) => (
                                            <tr key={u.id} className={`hover:bg-gray-50 ${u.is_suspended ? 'bg-red-50' : ''}`}>
                                                <td className="px-3 py-4 text-sm font-medium text-gray-900">{u.id}</td>
                                                <td className="px-3 py-4 text-sm text-gray-600">{u.full_name}</td>
                                                <td className="px-3 py-4 text-sm text-gray-600">{u.username || 'N/A'}</td>
                                                <td className="px-3 py-4 text-sm text-gray-600">{u.email}</td>
                                                <td className="px-3 py-4">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(u.role)}`}>
                                                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-4">
                                                    {u.is_suspended ? (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                            Suspended
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                            Active
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-4 text-sm space-x-2">
                                                    {u.role === 'user' || u.role === 'doctor' ? (
                                                        <>
                                                            {u.is_suspended ? (
                                                                <button onClick={() => handleUnsuspend(u.id)} className="text-green-600 hover:text-green-800 font-medium">Unsuspend</button>
                                                            ) : (
                                                                <button onClick={() => openSuspendModal(u)} className="text-orange-600 hover:text-orange-800 font-medium">Suspend</button>
                                                            )}
                                                        </>
                                                    ) : (u.role === 'admin' || u.role === 'staff') ? (
                                                        <>
                                                            {/* Only admins can edit/delete admin and staff accounts */}
                                                            {user?.role === 'admin' ? (
                                                                <>
                                                                    <button onClick={() => openModal('edit', u)} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                                                                    <button type="button" onClick={() => { setSelectedUser(u); setShowDeleteModal(true); }} className="text-red-600 hover:text-red-800 font-medium ml-2">Delete</button>
                                                                </>
                                                            ) : (
                                                                <span className="text-gray-400 text-xs italic">Admin Only</span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400">N/A</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-3 py-4 text-center text-gray-500">No registered accounts found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>
            </div>

            {/* User Modal */}
            {showUserModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
                    <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                            {modalMode === 'add' ? 'Add New Admin/Staff' : `Edit User: ${selectedUser?.full_name || selectedUser?.email}`}
                        </h2>

                        {errors.length > 0 && (
                            <div className="p-3 mb-4 rounded-lg bg-red-100 text-red-700 border border-red-300">
                                <ul className="list-disc pl-5 m-0">
                                    {errors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Username</label>
                                <input type="text" name="username" value={formData.username} onChange={handleInputChange} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <select name="role" value={formData.role} onChange={handleInputChange} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600">
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Password <span className="text-xs text-gray-500 ml-1">{modalMode === 'add' ? '(Required, min 6 chars)' : '(Optional - leave blank to keep current)'}</span>
                                </label>
                                <input type="password" name="password" value={formData.password} onChange={handleInputChange} required={modalMode === 'add'} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600" />
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                                    {modalMode === 'add' ? 'Add User' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) { setShowDeleteModal(false); setSelectedUser(null); } }}>
                    <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="mb-4 text-red-500 text-5xl">⚠️</div>
                            <h3 className="text-2xl font-semibold text-gray-800">Confirm Delete</h3>
                        </div>

                        <p className="text-gray-600 text-center mb-6">
                            WARNING: Delete <strong>{selectedUser.full_name || selectedUser.email}</strong>? This action cannot be undone.
                        </p>

                        <div className="flex justify-center gap-4">
                            <button type="button" onClick={() => { setShowDeleteModal(false); setSelectedUser(null); }} className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium">Cancel</button>
                            <button onClick={() => handleDelete(selectedUser.id)} className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-md">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Suspend Modal */}
            {showSuspendModal && selectedUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) closeSuspendModal(); }}>
                    <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="mb-4 text-orange-500 text-5xl">🚫</div>
                            <h3 className="text-2xl font-semibold text-gray-800">Suspend User Account</h3>
                        </div>

                        <p className="text-gray-600 mb-4">
                            You are about to suspend <strong>{selectedUser.full_name || selectedUser.email}</strong> ({selectedUser.email}). 
                            The user will not be able to log in until unsuspended.
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Suspension Reason <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={suspensionReason}
                                onChange={(e) => setSuspensionReason(e.target.value)}
                                placeholder="Enter the reason for suspension..."
                                rows="4"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 resize-none"
                            />
                        </div>

                        <div className="flex justify-end gap-4">
                            <button type="button" onClick={closeSuspendModal} className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium">Cancel</button>
                            <button onClick={handleSuspend} className="px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium shadow-md">Suspend Account</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
