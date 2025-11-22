import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import api from '../services/api';
import { 
    FaCalendarCheck, 
    FaMoneyBillWave, 
    FaCheckCircle, 
    FaClock,
    FaFilter,
    FaPrint,
    FaFileCsv,
    FaFilePdf,
    FaUserMd,
    FaBriefcaseMedical,
    FaTooth,
    FaChartLine,
    FaCalendarAlt,
    FaSignOutAlt
} from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const AdminReports = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
    });
    
    const [stats, setStats] = useState({
        totalAppointments: 0,
        totalRevenue: 0,
        paidRevenue: 0,
        pendingRevenue: 0
    });
    
    const [appointmentsData, setAppointmentsData] = useState({
        total: 0,
        confirmed: 0,
        pending: 0,
        cancelled: 0,
        declined: 0
    });
    
    const [revenueData, setRevenueData] = useState({
        totalRevenue: 0,
        paidRevenue: 0,
        pendingRevenue: 0
    });
    
    const [doctorsData, setDoctorsData] = useState([]);
    const [servicesData, setServicesData] = useState([]);
    const [statusDistribution, setStatusDistribution] = useState([]);
    const [paymentMethodsData, setPaymentMethodsData] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async (filterStartDate = startDate, filterEndDate = endDate) => {
        try {
            setLoading(true);
            
            // Fetch all appointments for the date range
            const response = await api.get(`/appointments/all?start_date=${filterStartDate}&end_date=${filterEndDate}`);
            const appointments = response.data;
            
            // Calculate statistics
            calculateStatistics(appointments);
            
        } catch (err) {
            console.error('Failed to fetch report data:', err);
        } finally {
            setLoading(false);
        }
    };

    const calculateStatistics = (appointments) => {
        // Appointments by status
        const confirmed = appointments.filter(a => a.status === 'confirmed').length;
        const pending = appointments.filter(a => a.status === 'pending').length;
        const cancelled = appointments.filter(a => a.status === 'cancelled').length;
        const declined = appointments.filter(a => a.status === 'declined').length;
        
        setAppointmentsData({
            total: appointments.length,
            confirmed,
            pending,
            cancelled,
            declined
        });
        
        setStatusDistribution([
            { status: 'confirmed', count: confirmed },
            { status: 'pending', count: pending },
            { status: 'cancelled', count: cancelled },
            { status: 'declined', count: declined }
        ]);
        
        // Revenue calculations
        const totalRevenue = appointments.reduce((sum, a) => sum + (parseFloat(a.service_price) || 0), 0);
        const paidRevenue = appointments
            .filter(a => a.payment_status === 'paid')
            .reduce((sum, a) => sum + (parseFloat(a.service_price) || 0), 0);
        const pendingRevenue = totalRevenue - paidRevenue;
        
        setRevenueData({ totalRevenue, paidRevenue, pendingRevenue });
        setStats({
            totalAppointments: appointments.length,
            totalRevenue,
            paidRevenue,
            pendingRevenue
        });
        
        // Payment methods
        const paymentMethods = {};
        appointments.forEach(a => {
            if (a.payment_status === 'paid') {
                const method = a.payment_method || 'clinic';
                paymentMethods[method] = (paymentMethods[method] || 0) + parseFloat(a.service_price || 0);
            }
        });
        
        setPaymentMethodsData(
            Object.entries(paymentMethods).map(([method, amount]) => ({
                payment_method: method,
                total_amount: amount
            }))
        );
        
        // Doctors performance
        const doctorStats = {};
        appointments.forEach(a => {
            const docId = a.doctor_id;
            if (!doctorStats[docId]) {
                doctorStats[docId] = {
                    doctor_name: `${a.doctor_first_name} ${a.doctor_last_name}`,
                    specialty: a.doctor_specialty || 'General',
                    total_appointments: 0,
                    confirmed: 0,
                    pending: 0,
                    revenue_generated: 0
                };
            }
            doctorStats[docId].total_appointments++;
            if (a.status === 'confirmed') doctorStats[docId].confirmed++;
            if (a.status === 'pending') doctorStats[docId].pending++;
            if (a.payment_status === 'paid') {
                doctorStats[docId].revenue_generated += parseFloat(a.service_price || 0);
            }
        });
        
        setDoctorsData(Object.values(doctorStats));
        
        // Services performance
        const serviceStats = {};
        appointments.forEach(a => {
            const serviceId = a.service_id;
            if (!serviceStats[serviceId]) {
                serviceStats[serviceId] = {
                    service_name: a.service_name,
                    base_price: parseFloat(a.service_price || 0),
                    times_booked: 0,
                    total_revenue: 0
                };
            }
            serviceStats[serviceId].times_booked++;
            if (a.payment_status === 'paid') {
                serviceStats[serviceId].total_revenue += parseFloat(a.service_price || 0);
            }
        });
        
        setServicesData(Object.values(serviceStats));
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchReportData(startDate, endDate);
    };

    const handleLogout = () => {
        setShowLogoutModal(false);
        logout();
        navigate('/login');
    };

    const handleExport = (type, format) => {
        // This would connect to backend export endpoints
        alert(`Export ${type} as ${format} - Feature coming soon!`);
    };

    // Chart data
    const statusChartData = {
        labels: statusDistribution.map(s => s.status.charAt(0).toUpperCase() + s.status.slice(1)),
        datasets: [{
            data: statusDistribution.map(s => s.count),
            backgroundColor: ['#3B82F6', '#F59E0B', '#EF4444', '#6B7280'],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };

    const paymentChartData = {
        labels: paymentMethodsData.map(p => p.payment_method.toUpperCase()),
        datasets: [{
            label: 'Revenue (₱)',
            data: paymentMethodsData.map(p => p.total_amount),
            backgroundColor: ['#10B981', '#3B82F6', '#F59E0B'],
            borderWidth: 0,
            borderRadius: 8
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { padding: 15, font: { size: 12 } }
            }
        }
    };

    const barChartOptions = {
        ...chartOptions,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => '₱' + value.toLocaleString()
                }
            }
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <AdminSidebar currentPage="reports" userRole={user?.role} />

            {/* Main Content */}
            <main className="flex-1 p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
                        <p className="text-gray-600 mt-1">Comprehensive reporting and data insights</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Welcome back,</p>
                            <p className="font-semibold text-gray-800">{user?.first_name} {user?.last_name}</p>
                        </div>
                    </div>
                </div>

                {/* Date Range Filter */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6 no-print">
                    <form onSubmit={handleFilterSubmit} className="flex items-end gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <FaFilter /> Apply Filter
                        </button>
                        <button 
                            type="button" 
                            onClick={() => window.print()}
                            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                            <FaPrint /> Print
                        </button>
                    </form>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Loading reports...</p>
                    </div>
                ) : (
                    <>
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white hover:transform hover:-translate-y-1 transition-all">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm font-medium">Total Appointments</p>
                                        <h3 className="text-3xl font-bold mt-2">{stats.totalAppointments}</h3>
                                    </div>
                                    <div className="bg-white bg-opacity-20 rounded-full p-4">
                                        <FaCalendarCheck className="text-3xl" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white hover:transform hover:-translate-y-1 transition-all">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                                        <h3 className="text-3xl font-bold mt-2">₱{stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                                    </div>
                                    <div className="bg-white bg-opacity-20 rounded-full p-4">
                                        <FaMoneyBillWave className="text-3xl" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white hover:transform hover:-translate-y-1 transition-all">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-emerald-100 text-sm font-medium">Paid Revenue</p>
                                        <h3 className="text-3xl font-bold mt-2">₱{stats.paidRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                                    </div>
                                    <div className="bg-white bg-opacity-20 rounded-full p-4">
                                        <FaCheckCircle className="text-3xl" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow-lg p-6 text-white hover:transform hover:-translate-y-1 transition-all">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-amber-100 text-sm font-medium">Pending Revenue</p>
                                        <h3 className="text-3xl font-bold mt-2">₱{stats.pendingRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                                    </div>
                                    <div className="bg-white bg-opacity-20 rounded-full p-4">
                                        <FaClock className="text-3xl" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Appointment Status Distribution</h2>
                                <div style={{ position: 'relative', height: '300px', maxHeight: '300px' }}>
                                    {statusDistribution.length > 0 ? (
                                        <Doughnut data={statusChartData} options={chartOptions} />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-500">
                                            No data available
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Methods</h2>
                                <div style={{ position: 'relative', height: '300px', maxHeight: '300px' }}>
                                    {paymentMethodsData.length > 0 ? (
                                        <Bar data={paymentChartData} options={barChartOptions} />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-500">
                                            No payment data available
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Appointments Report */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <FaCalendarCheck className="text-blue-600" /> Appointments Report
                                </h2>
                                <div className="flex gap-2 no-print">
                                    <button
                                        onClick={() => handleExport('appointments', 'csv')}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
                                    >
                                        <FaFileCsv /> Export CSV
                                    </button>
                                    <button
                                        onClick={() => handleExport('appointments', 'pdf')}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-1"
                                    >
                                        <FaFilePdf /> Export PDF
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                                    <p className="text-sm text-blue-600 font-medium">Confirmed</p>
                                    <p className="text-2xl font-bold text-blue-700 mt-1">{appointmentsData.confirmed}</p>
                                </div>
                                <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                                    <p className="text-sm text-amber-600 font-medium">Pending</p>
                                    <p className="text-2xl font-bold text-amber-700 mt-1">{appointmentsData.pending}</p>
                                </div>
                                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                                    <p className="text-sm text-red-600 font-medium">Cancelled</p>
                                    <p className="text-2xl font-bold text-red-700 mt-1">{appointmentsData.cancelled}</p>
                                </div>
                                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <p className="text-sm text-gray-600 font-medium">Declined</p>
                                    <p className="text-2xl font-bold text-gray-700 mt-1">{appointmentsData.declined}</p>
                                </div>
                            </div>
                        </div>

                        {/* Revenue Report */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <FaMoneyBillWave className="text-green-600" /> Revenue Report
                                </h2>
                                <div className="flex gap-2 no-print">
                                    <button
                                        onClick={() => handleExport('revenue', 'csv')}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
                                    >
                                        <FaFileCsv /> Export CSV
                                    </button>
                                    <button
                                        onClick={() => handleExport('revenue', 'pdf')}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-1"
                                    >
                                        <FaFilePdf /> Export PDF
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                                    <p className="text-sm text-green-600 font-medium">Total Revenue</p>
                                    <p className="text-2xl font-bold text-green-700 mt-1">₱{revenueData.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div className="border border-emerald-200 rounded-lg p-4 bg-emerald-50">
                                    <p className="text-sm text-emerald-600 font-medium">Paid</p>
                                    <p className="text-2xl font-bold text-emerald-700 mt-1">₱{revenueData.paidRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                                    <p className="text-sm text-amber-600 font-medium">Pending</p>
                                    <p className="text-2xl font-bold text-amber-700 mt-1">₱{revenueData.pendingRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>
                        </div>

                        {/* Doctors Performance */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <FaUserMd className="text-purple-600" /> Doctors Performance
                                </h2>
                                <div className="flex gap-2 no-print">
                                    <button
                                        onClick={() => handleExport('doctors', 'csv')}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
                                    >
                                        <FaFileCsv /> Export CSV
                                    </button>
                                    <button
                                        onClick={() => handleExport('doctors', 'pdf')}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-1"
                                    >
                                        <FaFilePdf /> Export PDF
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Confirmed</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {doctorsData.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">No data available for this period</td>
                                            </tr>
                                        ) : (
                                            doctorsData.map((doctor, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{doctor.doctor_name}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{doctor.specialty}</td>
                                                    <td className="px-4 py-3 text-sm text-center text-gray-900 font-semibold">{doctor.total_appointments}</td>
                                                    <td className="px-4 py-3 text-sm text-center text-green-600">{doctor.confirmed}</td>
                                                    <td className="px-4 py-3 text-sm text-center text-amber-600">{doctor.pending}</td>
                                                    <td className="px-4 py-3 text-sm text-right text-gray-900 font-semibold">₱{doctor.revenue_generated.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Services Report */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <FaBriefcaseMedical className="text-indigo-600" /> Services Report
                                </h2>
                                <div className="flex gap-2 no-print">
                                    <button
                                        onClick={() => handleExport('services', 'csv')}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
                                    >
                                        <FaFileCsv /> Export CSV
                                    </button>
                                    <button
                                        onClick={() => handleExport('services', 'pdf')}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-1"
                                    >
                                        <FaFilePdf /> Export PDF
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider no-print">Popularity</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {servicesData.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">No data available for this period</td>
                                            </tr>
                                        ) : (
                                            servicesData.map((service, idx) => {
                                                const maxBookings = Math.max(...servicesData.map(s => s.times_booked));
                                                const popularity = maxBookings > 0 ? (service.times_booked / maxBookings) * 100 : 0;
                                                
                                                return (
                                                    <tr key={idx} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{service.service_name}</td>
                                                        <td className="px-4 py-3 text-sm text-right text-gray-600">₱{service.base_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                                        <td className="px-4 py-3 text-sm text-center text-gray-900 font-semibold">{service.times_booked}</td>
                                                        <td className="px-4 py-3 text-sm text-right text-green-600 font-semibold">₱{service.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                                        <td className="px-4 py-3 text-sm no-print">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                                                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${popularity}%` }}></div>
                                                                </div>
                                                                <span className="text-xs text-gray-600">{Math.round(popularity)}%</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </main>

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

export default AdminReports;
