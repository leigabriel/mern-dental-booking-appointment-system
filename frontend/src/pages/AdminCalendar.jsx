import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import api from '../services/api';
import { 
    FaCalendarAlt, 
    FaPrint, 
    FaChevronLeft, 
    FaChevronRight, 
    FaCalendarDay,
    FaTooth,
    FaUserMd,
    FaCalendarCheck,
    FaBriefcaseMedical,
    FaChartLine,
    FaSignOutAlt
} from 'react-icons/fa';

const AdminCalendar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [selectedDay, setSelectedDay] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [monthCache, setMonthCache] = useState({});
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    useEffect(() => {
        loadCalendarData();
    }, [currentDate]);

    const loadCalendarData = async () => {
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const key = `${year}-${String(month).padStart(2, '0')}`;

        try {
            // Use cache if available
            if (monthCache[key]) {
                setEvents(monthCache[key]);
                setLoading(false);
                return;
            }

            console.log(`Loading appointments for ${month}/${year}...`);
            const response = await api.get(`/appointments/json?month=${month}&year=${year}`);
            console.log('Calendar API response:', response.data);
            
            const appointmentData = response.data.events || [];
            console.log(`Loaded ${appointmentData.length} appointments`);
            
            // Log first appointment structure
            if (appointmentData.length > 0) {
                console.log('First appointment structure:', appointmentData[0]);
                console.log('Date field:', appointmentData[0].date);
            }
            
            // Log status breakdown
            const statusCounts = appointmentData.reduce((acc, apt) => {
                acc[apt.status] = (acc[apt.status] || 0) + 1;
                return acc;
            }, {});
            console.log('Appointments by status:', statusCounts);
            
            setEvents(appointmentData);
            setMonthCache(prev => ({ ...prev, [key]: appointmentData }));
            setError('');
        } catch (err) {
            console.error('Failed to load calendar data:', err);
            console.error('Error details:', err.response?.data);
            setError('Could not load calendar data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    };

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getMonthDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        return {
            firstDay,
            lastDay,
            startingDayOfWeek: firstDay.getDay(),
            daysInMonth: lastDay.getDate()
        };
    };

    const getDayAppointments = (date) => {
        const dateStr = formatDate(date);
        
        const dayAppointments = events.filter(event => {
            // Handle both date formats - the API returns 'date' field
            const eventDate = event.date;
            return eventDate === dateStr;
        });
        
        return dayAppointments;
    };

    const getStatusColor = (status) => {
        const colors = {
            confirmed: 'bg-green-500',
            pending: 'bg-yellow-500',
            declined: 'bg-red-500',
            cancelled: 'bg-gray-500'
        };
        return colors[status] || 'bg-blue-500';
    };

    const getStatusBadge = (status) => {
        const badges = {
            confirmed: 'bg-green-100 text-green-700',
            pending: 'bg-yellow-100 text-yellow-700',
            declined: 'bg-red-100 text-red-700',
            cancelled: 'bg-gray-100 text-gray-600'
        };
        return badges[status] || 'bg-blue-100 text-blue-700';
    };

    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setSelectedDay(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedDay(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleToday = () => {
        const today = new Date();
        setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
        setSelectedDay(today);
    };

    const handleLogout = () => {
        setShowLogoutModal(false);
        logout();
        navigate('/login');
    };

    const renderCalendar = () => {
        const { startingDayOfWeek, daysInMonth } = getMonthDays();
        const days = [];

        // Empty cells before first day
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day min-h-[120px]"></div>);
        }

        // Calendar days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dayAppointments = getDayAppointments(date);
            const isSelectedDay = formatDate(date) === formatDate(selectedDay);
            const isTodayDate = isToday(date);

            days.push(
                <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(date)}
                    className={`calendar-day min-h-[120px] relative p-4 rounded-lg border text-left bg-white hover:border-blue-400 cursor-pointer transition-all
                        ${isTodayDate ? 'border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100' : 'border-gray-200'}
                        ${isSelectedDay ? 'ring-2 ring-blue-500' : ''}
                        hover:transform hover:-translate-y-1 hover:shadow-lg`}
                >
                    <div className="text-xl font-bold text-gray-800 mb-2">{day}</div>
                    {dayAppointments.length > 0 && (
                        <div className="space-y-1">
                            {dayAppointments.slice(0, 3).map((event, idx) => (
                                <div 
                                    key={idx} 
                                    className="text-xs p-1 rounded bg-blue-50 border-l-2 border-blue-500 text-gray-700"
                                >
                                    <span className={`appointment-dot w-1.5 h-1.5 rounded-full inline-block mr-1 ${getStatusColor(event.status)}`}></span>
                                    {formatTime(event.time)}
                                </div>
                            ))}
                            {dayAppointments.length > 3 && (
                                <div className="text-xs text-blue-600 font-semibold mt-1">
                                    +{dayAppointments.length - 3} more
                                </div>
                            )}
                        </div>
                    )}
                </button>
            );
        }

        return days;
    };

    const renderDayDetails = () => {
        const dayAppointments = getDayAppointments(selectedDay);
        
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">
                        {selectedDay.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                        })}
                    </h3>
                    <button
                        onClick={() => window.print()}
                        className="no-print px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition-all flex items-center gap-2"
                    >
                        <FaPrint /> Print Schedule
                    </button>
                </div>
                
                {dayAppointments.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 border border-gray-200 rounded-lg">
                        No appointments for this day.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                        {dayAppointments.map((event, idx) => (
                            <div 
                                key={idx} 
                                className="p-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="text-base font-semibold text-gray-800 mb-1">
                                        {formatTime(event.time)} • {event.service}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Patient: {event.user}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Doctor: Dr. {event.doctor}
                                    </div>
                                </div>
                                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getStatusBadge(event.status)}`}>
                                    {event.status.toUpperCase()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <AdminSidebar currentPage="calendar" userRole={user?.role} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
                    <header className="mb-8">
                        <h1 className="text-7xl font-extrabold text-gray-900">Calendar View</h1>
                        <p className="text-lg text-gray-600 mt-1">Full calendar overview of all appointments</p>
                    </header>

                    {/* Calendar Section */}
                    <section className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handlePrevMonth}
                                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all"
                                >
                                    <FaChevronLeft />
                                </button>
                                <h2 className="text-3xl font-bold text-gray-800">
                                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </h2>
                                <button
                                    onClick={handleNextMonth}
                                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all"
                                >
                                    <FaChevronRight />
                                </button>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleToday}
                                    className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-semibold shadow-md transition-all"
                                >
                                    Today
                                </button>
                                <div className="text-base text-gray-700 font-semibold">
                                    Total Appointments: <span className="text-blue-600">{events.length}</span>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 text-sm rounded-lg border border-red-200 bg-red-50 text-red-700">
                                {error}
                            </div>
                        )}

                        {/* Calendar Header - Days of Week */}
                        <div className="grid grid-cols-7 gap-2 mb-2">
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                                <div key={day} className="text-center text-sm font-bold text-gray-700 py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                <p className="mt-4 text-gray-600">Loading calendar...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-7 gap-2">
                                {renderCalendar()}
                            </div>
                        )}
                    </section>

                    {/* Selected Day Details */}
                    {renderDayDetails()}
                </main>
            </div>

            {/* Logout Modal */}
            {showLogoutModal && (
                <div 
                    className="no-print fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
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
        </div>
    );
};

export default AdminCalendar;
