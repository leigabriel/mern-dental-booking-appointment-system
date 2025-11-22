import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    FaTooth,
    FaChartLine,
    FaCalendarAlt,
    FaCalendarCheck,
    FaUserMd,
    FaBriefcaseMedical,
    FaSignOutAlt,
    FaUsers
} from 'react-icons/fa';
import { useState } from 'react';

const AdminSidebar = ({ currentPage = 'dashboard', userRole = 'admin' }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogout = () => {
        setShowLogoutModal(false);
        logout();
        navigate('/login');
    };

    const isAdmin = userRole === 'admin';
    const isStaff = userRole === 'staff' || userRole === 'admin';

    const navItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: FaChartLine,
            path: isAdmin ? '/admin/dashboard' : '/staff/dashboard',
            color: 'from-blue-500 to-blue-600',
            show: true
        },
        {
            id: 'calendar',
            label: 'Calendar',
            icon: FaCalendarAlt,
            path: '/admin/calendar',
            color: 'from-purple-500 to-purple-600',
            show: isStaff
        },
        {
            id: 'appointments',
            label: 'Appointments',
            icon: FaCalendarCheck,
            path: '/admin/appointments',
            color: 'from-amber-500 to-amber-600',
            show: isStaff
        },
        {
            id: 'doctors',
            label: 'Doctors',
            icon: FaUserMd,
            path: '/admin/doctors',
            color: 'from-teal-500 to-teal-600',
            show: isStaff
        },
        {
            id: 'services',
            label: 'Services',
            icon: FaBriefcaseMedical,
            path: '/admin/services',
            color: 'from-indigo-500 to-indigo-600',
            show: isStaff
        },
        {
            id: 'reports',
            label: 'Reports',
            icon: FaChartLine,
            path: '/admin/reports',
            color: 'from-pink-500 to-pink-600',
            show: isAdmin // Only admins can view reports
        }
    ];

    return (
        <>
            <aside className="w-20 bg-blue-900 text-gray-300 p-3 flex flex-col items-center justify-between shadow-2xl sticky top-0 h-screen z-20">
                <div>
                    <button 
                        onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/staff/dashboard')}
                        className="flex items-center justify-center h-12 w-12 mb-8 rounded-full bg-gray-800 border-gray-700 border-2 text-white shadow-md hover:bg-gray-700 transition-colors"
                        title="Home"
                    >
                        <FaTooth className="text-white text-xl" />
                    </button>

                    <nav className="space-y-4">
                        {navItems.filter(item => item.show).map(item => {
                            const Icon = item.icon;
                            const isActive = currentPage === item.id;
                            
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => navigate(item.path)}
                                    className={`flex items-center justify-center h-12 w-12 rounded-full transition-all duration-300 relative group border-2 shadow-lg hover:shadow-xl hover:scale-105 ${
                                        isActive 
                                            ? `bg-gradient-to-br ${item.color} border-opacity-100` 
                                            : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                                    } text-white`}
                                    title={item.label}
                                >
                                    <Icon className="text-xl" />
                                    <span className="absolute left-full ml-3 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30">
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div>
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="flex items-center justify-center h-12 w-12 bg-red-600 border-2 border-red-500 rounded-full text-white hover:bg-red-700 hover:border-red-600 transition-colors relative group"
                        title="Logout"
                    >
                        <FaSignOutAlt className="text-xl" />
                        <span className="absolute left-full ml-3 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30">
                            Logout
                        </span>
                    </button>
                </div>
            </aside>

            {/* Logout Modal */}
            {showLogoutModal && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setShowLogoutModal(false)}
                >
                    <div 
                        className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="mb-4 text-red-500 text-5xl">
                                <FaSignOutAlt />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-800">Confirm Logout</h3>
                        </div>
                        <p className="text-gray-600 text-center mb-8">
                            Are you sure you want to logout? This will end your current session.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-150 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-150 font-medium shadow-md"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminSidebar;
