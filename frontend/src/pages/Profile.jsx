import { useState, useEffect, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import appointmentService from '../services/appointment.service';
import authService from '../services/auth.service';

const Profile = () => {
    const { user, logout } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        username: ''
    });
    const [message, setMessage] = useState('');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);
    const [declineMessage, setDeclineMessage] = useState('');
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const receiptRef = useRef(null);

    // Redirect if admin or staff
    if (user && (user.role === 'admin' || user.role === 'staff')) {
        return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/staff/dashboard'} replace />;
    }

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [profileData, appointmentsData] = await Promise.all([
                authService.getProfile(),
                appointmentService.getMyAppointments()
            ]);
            setProfile(profileData);
            setAppointments(appointmentsData);
            setFormData({
                name: profileData.name,
                username: profileData.username
            });
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await authService.updateProfile(formData);
            setMessage('Profile updated successfully!');
            setEditing(false);
            loadData();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error updating profile');
        }
    };

    const handleCancel = async (appointmentId) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

        try {
            await appointmentService.cancel(appointmentId);
            setMessage('Appointment cancelled successfully!');
            loadData();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error cancelling appointment');
        }
    };

    const handleClearHistory = async () => {
        try {
            const result = await appointmentService.clearHistory();
            setMessage(result.message || 'Appointment history cleared successfully!');
            setShowClearHistoryModal(false);
            loadData();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error clearing history');
            setShowClearHistoryModal(false);
        }
    };

    const handleLogout = () => {
        logout();
        setShowLogoutModal(false);
    };

    const openDeclineModal = (msg) => {
        setDeclineMessage(msg);
        setShowDeclineModal(true);
    };

    const openAppointmentModal = (app) => {
        setSelectedAppointment(app);
        setShowAppointmentModal(true);
    };

    const handleDownloadReceipt = async (app) => {
        try {
            // Create canvas from the receipt element
            const receiptElement = receiptRef.current;
            if (!receiptElement) return;

            // Use html2canvas alternative - create SVG and convert to image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size
            canvas.width = 600;
            canvas.height = 800;
            
            // Fill background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw header gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, 150);
            gradient.addColorStop(0, '#10b981');
            gradient.addColorStop(1, '#059669');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, 150);
            
            // Draw title
            ctx.fillStyle = 'white';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('DENTALCARE', canvas.width / 2, 60);
            
            ctx.font = '14px Arial';
            ctx.fillText('Appointment Confirmation Receipt', canvas.width / 2, 90);
            
            // Draw content
            ctx.fillStyle = '#1f2937';
            ctx.textAlign = 'left';
            ctx.font = '11px Arial';
            
            let yPos = 180;
            const leftMargin = 50;
            
            // Appointment ID
            ctx.fillStyle = '#6b7280';
            ctx.fillText('APPOINTMENT ID', canvas.width / 2 - 100, yPos);
            ctx.font = 'bold 24px Courier New';
            ctx.fillStyle = '#1f2937';
            ctx.fillText(`#${String(app.id).padStart(6, '0')}`, canvas.width / 2 - 60, yPos + 30);
            
            yPos += 70;
            ctx.font = '11px Arial';
            
            // Patient Name
            ctx.fillStyle = '#6b7280';
            ctx.fillText('PATIENT NAME', leftMargin, yPos);
            ctx.font = 'bold 16px Arial';
            ctx.fillStyle = '#1f2937';
            ctx.fillText(profile?.name || 'N/A', leftMargin, yPos + 20);
            
            yPos += 50;
            ctx.font = '11px Arial';
            
            // Doctor
            ctx.fillStyle = '#6b7280';
            ctx.fillText('DOCTOR', leftMargin, yPos);
            ctx.font = 'bold 16px Arial';
            ctx.fillStyle = '#1f2937';
            ctx.fillText(app.doctor_name || 'N/A', leftMargin, yPos + 20);
            ctx.font = '13px Arial';
            ctx.fillStyle = '#6366f1';
            ctx.fillText('Dental Specialist', leftMargin, yPos + 40);
            
            yPos += 70;
            ctx.font = '11px Arial';
            
            // Service
            ctx.fillStyle = '#6b7280';
            ctx.fillText('SERVICE', leftMargin, yPos);
            ctx.font = 'bold 16px Arial';
            ctx.fillStyle = '#1f2937';
            ctx.fillText(app.service_name || 'N/A', leftMargin, yPos + 20);
            
            yPos += 50;
            ctx.font = '11px Arial';
            
            // Date
            ctx.fillStyle = '#6b7280';
            ctx.fillText('APPOINTMENT DATE', leftMargin, yPos);
            ctx.font = '14px Arial';
            ctx.fillStyle = '#1f2937';
            const dateStr = new Date(app.appointment_date).toLocaleDateString('en-US', { 
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
            });
            ctx.fillText(dateStr, leftMargin, yPos + 20);
            
            yPos += 50;
            ctx.font = '11px Arial';
            
            // Time
            ctx.fillStyle = '#6b7280';
            ctx.fillText('APPOINTMENT TIME', leftMargin, yPos);
            ctx.font = 'bold 14px Arial';
            ctx.fillStyle = '#1f2937';
            ctx.fillText(app.appointment_time, leftMargin, yPos + 20);
            
            yPos += 50;
            ctx.font = '11px Arial';
            
            // Status
            ctx.fillStyle = '#6b7280';
            ctx.fillText('STATUS', leftMargin, yPos);
            ctx.fillStyle = '#065f46';
            ctx.fillRect(leftMargin, yPos + 10, 120, 30);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px Arial';
            ctx.fillText('✓ CONFIRMED', leftMargin + 10, yPos + 30);
            
            yPos += 60;
            ctx.font = '11px Arial';
            
            // Payment Method
            ctx.fillStyle = '#6b7280';
            ctx.fillText('PAYMENT METHOD', leftMargin, yPos);
            ctx.font = '16px Arial';
            ctx.fillStyle = '#1f2937';
            ctx.fillText(app.payment_method ? app.payment_method.toUpperCase() : 'CLINIC', leftMargin, yPos + 20);
            
            yPos += 50;
            ctx.font = '11px Arial';
            
            // Payment Status
            ctx.fillStyle = '#6b7280';
            ctx.fillText('PAYMENT STATUS', leftMargin, yPos);
            ctx.font = '16px Arial';
            ctx.fillStyle = '#1f2937';
            ctx.fillText(app.payment_status ? app.payment_status.toUpperCase() : 'PENDING', leftMargin, yPos + 20);
            
            // Footer
            yPos += 60;
            ctx.font = '12px Arial';
            ctx.fillStyle = '#6b7280';
            ctx.textAlign = 'center';
            ctx.fillText('Please arrive 10 minutes before your scheduled appointment.', canvas.width / 2, yPos);
            ctx.fillText('For questions or to reschedule, please contact us in advance.', canvas.width / 2, yPos + 20);
            ctx.font = 'bold 12px Arial';
            ctx.fillStyle = '#10b981';
            ctx.fillText('Thank you for choosing DentalCare!', canvas.width / 2, yPos + 50);
            
            // Convert canvas to blob and download
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Receipt_${String(app.id).padStart(6, '0')}_${new Date().toISOString().split('T')[0]}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                setMessage('Receipt downloaded successfully!');
            });
        } catch (error) {
            console.error('Error downloading receipt:', error);
            setMessage('Error downloading receipt. Please try again.');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-amber-50 text-amber-700 border-amber-100',
            confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            cancelled: 'bg-rose-50 text-rose-700 border-rose-100',
            completed: 'bg-blue-50 text-blue-700 border-blue-100',
            declined: 'bg-rose-50 text-rose-700 border-rose-100'
        };
        return styles[status] || 'bg-slate-50 text-slate-700 border-slate-100';
    };

    const getPaymentMethodBadge = (method) => {
        const badges = {
            gcash: (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                    </svg>
                    GCash
                </span>
            ),
            paypal: (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8.32 21.97a.546.546 0 01-.26.04h-.06c-.16 0-.31-.06-.42-.18-.13-.13-.18-.31-.16-.49l.52-3.38h2.46c3.27 0 5.93-2.66 5.93-5.93 0-.39-.04-.77-.11-1.14l1.31-8.54A.546.546 0 0118 2h-6.93c-.3 0-.55.21-.61.5l-1.36 8.86c-.05.33-.15.65-.29.96h-.05c-.83 2.12-2.84 3.61-5.2 3.61h-.09l-.52 3.38c-.03.18.02.36.16.49.11.12.26.18.42.18h.06c.09 0 .18-.01.26-.04L8.32 21.97z" />
                    </svg>
                    PayPal
                </span>
            ),
            clinic: (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
                    </svg>
                    Clinic
                </span>
            )
        };
        return badges[method] || <span className="text-xs text-slate-500">N/A</span>;
    };

    const getPaymentStatusBadge = (status) => {
        const badges = {
            paid: (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Paid
                </span>
            ),
            refunded: (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9h2v4h-2V9zM9 7h2v1H9V7z" clipRule="evenodd" />
                    </svg>
                    Refunded
                </span>
            ),
            unpaid: (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Unpaid
                </span>
            ),
            pending: (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Pending
                </span>
            )
        };
        return badges[status] || <span className="text-xs text-slate-500">N/A</span>;
    };

    if (loading) {
        return (
            <div className="relative isolate bg-blue-950 flex items-center justify-center min-h-screen p-6 text-slate-800">
                <div className="text-xl text-white">Loading...</div>
            </div>
        );
    }

    const confirmedAppointments = appointments.filter(app => app.status === 'confirmed');

    return (
        <div className="relative isolate bg-blue-950 flex items-center justify-center min-h-screen p-6 sm:p-10 text-slate-800">
            {/* Hidden receipt reference for canvas rendering */}
            <div ref={receiptRef} style={{ position: 'absolute', left: '-9999px' }} />
            
            {/* Background Blurs */}
            <div aria-hidden="true" className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                <div style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }} className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
            </div>

            <div className="max-w-8xl bg-blue-900 border-4 border-white rounded-2xl p-8 mx-auto space-y-6 w-full">
                {/* HEADER */}
                <header className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white shadow-sm rounded-2xl p-6 border">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white text-4xl italic font-bold shadow-md">
                            {profile?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900">{profile?.name}</h1>
                            <p className="bg-blue-600 p-1 px-4 rounded-2xl text-sm text-white">
                                @{profile?.username} • <span className="text-xs text-gray-300">Member since {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link to="/landing" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-50 border rounded-lg text-sm text-slate-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Home
                        </Link>
                        <Link to="/book" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm shadow">
                            Book Appointment
                        </Link>
                        <button onClick={() => setShowLogoutModal(true)} className="group relative rounded-full p-1 bg-red-700 flex border-2 border-gray-600 items-center text-sm/6 font-semibold text-white hover:text-red-300">
                            <img src="https://cdn-icons-png.flaticon.com/128/10609/10609328.png" alt="Logout" className="h-6 w-6 filter invert" />
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-700 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                Log out
                            </span>
                        </button>
                    </div>
                </header>

                {/* FLASH MESSAGE */}
                {message && (
                    <div className={`p-4 rounded-xl ${message.includes('Error') || message.includes('error') ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                        {message}
                    </div>
                )}

                {/* MAIN CONTENT */}
                <div className="space-y-6">
                    {/* TOP SECTION: PROFILE & CONFIRMED APPOINTMENTS */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* LEFT: PROFILE SETTINGS */}
                        <aside className="col-span-1 bg-white border rounded-2xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">Profile Settings</h2>
                            {editing ? (
                                <form onSubmit={handleUpdate} className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="mt-1 block w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-400 outline-none transition"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="username" className="block text-sm font-medium text-slate-700">Username</label>
                                        <input
                                            type="text"
                                            id="username"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className="mt-1 block w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-400 outline-none transition"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={profile?.email}
                                            readOnly
                                            className="mt-1 block w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <button type="button" onClick={() => setEditing(false)} className="text-sm text-slate-600 hover:underline">Cancel</button>
                                        <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold">Save changes</button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Full Name</label>
                                        <p className="mt-1 text-slate-900">{profile?.name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Username</label>
                                        <p className="mt-1 text-slate-900">@{profile?.username}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Email Address</label>
                                        <p className="mt-1 text-slate-900">{profile?.email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Role</label>
                                        <p className="mt-1 text-slate-900 capitalize">{profile?.role}</p>
                                    </div>
                                    <div className="pt-2">
                                        <button onClick={() => setEditing(true)} className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold">Edit Profile</button>
                                    </div>
                                </div>
                            )}
                        </aside>

                        {/* RIGHT: CONFIRMED APPOINTMENTS LIST */}
                        <section className="col-span-2 bg-white border rounded-2xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                        <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Confirmed Appointments
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1">Your upcoming confirmed visits</p>
                                </div>
                                <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold shadow-sm">
                                    {confirmedAppointments.length} Active
                                </span>
                            </div>

                            {confirmedAppointments.length > 0 ? (
                                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                                    {confirmedAppointments.map((app) => (
                                        <div 
                                            key={app.id} 
                                            onClick={() => openAppointmentModal(app)}
                                            className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-blue-50 border-l-4 border-emerald-600 rounded-lg hover:shadow-lg cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
                                                    {new Date(app.appointment_date).getDate()}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-slate-900 text-base">{app.service_name}</h3>
                                                    <p className="text-sm text-slate-600">Dr. {app.doctor_name}</p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-xs text-slate-500">
                                                            {new Date(app.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                        <span className="text-xs text-slate-500">•</span>
                                                        <span className="text-xs font-semibold text-emerald-600">{app.appointment_time}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getPaymentStatusBadge(app.payment_status || 'pending')}
                                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <svg className="w-20 h-20 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Confirmed Appointments</h3>
                                    <p className="text-slate-500 mb-4">You don't have any confirmed appointments yet.</p>
                                    <Link to="/book" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-lg transition">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Book Your First Appointment
                                    </Link>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* BOTTOM SECTION: ALL APPOINTMENTS TABLE */}
                    <section className="bg-white border rounded-2xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                    <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Appointment History
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">Complete record of all your appointments</p>
                            </div>
                            {appointments.length > 0 && (
                                <button type="button" onClick={() => setShowClearHistoryModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-semibold shadow-lg transition-all transform hover:scale-105">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Clear All History
                                </button>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="text-left text-xs text-slate-500 border border-gray-300/50">
                                        <th className="py-2 px-3">Doctor</th>
                                        <th className="py-2 px-3">Service</th>
                                        <th className="py-2 px-3">Date</th>
                                        <th className="py-2 px-3">Time</th>
                                        <th className="py-2 px-3">Payment</th>
                                        <th className="py-2 px-3">Status</th>
                                        <th className="py-2 px-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y border border-gray-300/50">
                                    {appointments.length > 0 ? (
                                        appointments.map((app) => (
                                            <tr key={app.id} className="hover:bg-blue-200">
                                                <td className="py-3 px-3">{app.doctor_name || 'N/A'}</td>
                                                <td className="py-3 px-3">{app.service_name || 'N/A'}</td>
                                                <td className="py-3 px-3">{new Date(app.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                                <td className="py-3 px-3"><span className="font-medium text-slate-700">{app.appointment_time}</span></td>
                                                <td className="py-3 px-3">
                                                    {getPaymentMethodBadge(app.payment_method || 'clinic')}
                                                    <br />
                                                    {getPaymentStatusBadge(app.payment_status || 'pending')}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(app.status)}`}>
                                                        {app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <div className="flex items-center gap-2">
                                                        {app.status === 'pending' ? (
                                                            <button onClick={() => handleCancel(app.id)} className="inline-flex items-center gap-2 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded">
                                                                Cancel
                                                            </button>
                                                        ) : app.status === 'declined' && app.notes ? (
                                                            <button type="button" onClick={() => openDeclineModal(app.notes)} className="inline-flex items-center gap-2 px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded">
                                                                View message
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-slate-500">—</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="py-6 text-center text-slate-500">You have no scheduled appointments.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>

            {/* Background Blur Bottom */}
            <div aria-hidden="true" className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
                <div style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }} className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[50.1875rem]"></div>
            </div>

            {/* Appointment Detail Modal */}
            {showAppointmentModal && selectedAppointment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAppointmentModal(false)}>
                    <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-bold">DENTALCARE</h3>
                                    <p className="text-sm text-emerald-100">Appointment Details</p>
                                </div>
                                <button onClick={() => setShowAppointmentModal(false)} className="text-white hover:text-emerald-100">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Appointment ID */}
                            <div className="text-center pb-4 border-b border-dashed">
                                <p className="text-xs text-slate-500 uppercase tracking-wider">Appointment ID</p>
                                <p className="text-2xl font-mono font-bold text-slate-900 mt-1">#{String(selectedAppointment.id).padStart(6, '0')}</p>
                            </div>

                            {/* Patient Info */}
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Patient Name</p>
                                <p className="text-lg font-bold text-slate-900">{profile?.name || 'N/A'}</p>
                            </div>

                            {/* Doctor Info */}
                            <div className="bg-slate-50 rounded-lg p-4">
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Doctor</p>
                                <p className="text-lg font-bold text-slate-900">{selectedAppointment.doctor_name || 'N/A'}</p>
                                <p className="text-sm text-indigo-600 font-semibold">Dental Specialist</p>
                            </div>

                            {/* Service Info */}
                            <div className="bg-slate-50 rounded-lg p-4">
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Service</p>
                                <p className="text-lg font-bold text-slate-900">{selectedAppointment.service_name || 'N/A'}</p>
                            </div>

                            {/* Date & Time */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Date</p>
                                    <p className="text-sm font-bold text-slate-900">
                                        {new Date(selectedAppointment.appointment_date).toLocaleDateString('en-US', { 
                                            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
                                        })}
                                    </p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Time</p>
                                    <p className="text-sm font-bold text-slate-900">{selectedAppointment.appointment_time}</p>
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Status</p>
                                <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
                                    ✓ CONFIRMED
                                </span>
                            </div>

                            {/* Payment Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Payment Method</p>
                                    <p className="text-base font-bold text-slate-900">
                                        {selectedAppointment.payment_method ? selectedAppointment.payment_method.toUpperCase() : 'CLINIC'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Payment Status</p>
                                    {getPaymentStatusBadge(selectedAppointment.payment_status || 'pending')}
                                </div>
                            </div>

                            {/* Note */}
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                                <p className="text-sm text-slate-600">Please arrive 10 minutes before your scheduled appointment.</p>
                                <p className="text-sm text-emerald-600 font-semibold mt-2">✓ Confirmed & Ready</p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-slate-50 border-t flex gap-3">
                            <button
                                onClick={() => setShowAppointmentModal(false)}
                                className="flex-1 px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold transition"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    handleDownloadReceipt(selectedAppointment);
                                    setShowAppointmentModal(false);
                                }}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-bold shadow-lg transition flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download Receipt
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Clear All History Modal */}
            {showClearHistoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="relative w-full max-w-md border-2 border-rose-300 duration-500 overflow-hidden rounded-2xl bg-white text-slate-900 p-6 shadow-2xl">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="mb-4 p-4 rounded-full bg-rose-100">
                                <svg className="w-12 h-12 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">Clear All History?</h3>
                            <p className="text-sm text-slate-600 mt-2">This will permanently delete all your appointment records</p>
                        </div>

                        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-rose-800 font-semibold mb-2">⚠️ Warning: This action cannot be undone!</p>
                            <ul className="text-xs text-rose-700 space-y-1 list-disc list-inside">
                                <li>All appointment history will be deleted</li>
                                <li>Pending, declined, and cancelled records will be removed</li>
                                <li>Confirmed appointments will remain active</li>
                            </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button onClick={() => setShowClearHistoryModal(false)} className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold transition-all transform hover:scale-105">
                                Cancel
                            </button>
                            <button onClick={handleClearHistory} className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
                                Yes, Clear All History
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Decline Message Modal */}
            {showDeclineModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDeclineModal(false)}>
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3">
                            <span className="shrink-0 rounded-full bg-red-100 p-2 text-red-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12V16.5zm0-12a9 9 0 100 18 9 9 0 000-18z" />
                                </svg>
                            </span>
                            <h3 className="text-lg sm:text-xl font-semibold text-red-600">Decline Reason</h3>
                        </div>

                        <div className="mt-4 border border-gray-400/50 p-8">
                            <p className="text-[#212631] text-2xl leading-relaxed">{declineMessage}</p>
                        </div>

                        <p className="mt-8 bg-blue-700 text-white rounded-xl p-2 px-4">From: DentalCare</p>
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setShowDeclineModal(false)} className="rounded-lg bg-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-300 transition">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="relative w-96 h-64 border-2 border-white duration-500 group overflow-hidden rounded-xl bg-neutral-900 text-neutral-50 p-6 flex flex-col justify-evenly shadow-xl">
                        {/* Background Blobs */}
                        <div className="absolute blur duration-500 group-hover:blur-none w-72 h-72 rounded-full group-hover:translate-x-10 group-hover:translate-y-10 bg-red-900 right-1 -bottom-24"></div>
                        <div className="absolute blur duration-500 group-hover:blur-none w-12 h-12 rounded-full group-hover:translate-x-8 group-hover:translate-y-2 bg-rose-700 right-12 bottom-12"></div>
                        <div className="absolute blur duration-500 group-hover:blur-none w-36 h-36 rounded-full group-hover:translate-x-10 group-hover:-translate-y-10 bg-rose-800 right-1 -top-12"></div>
                        <div className="absolute blur duration-500 group-hover:blur-none w-24 h-24 bg-red-700 rounded-full group-hover:-translate-x-10"></div>

                        {/* Foreground Content */}
                        <div className="z-10 flex flex-col justify-evenly h-full text-center">
                            <h3 className="text-2xl font-bold mb-1">Confirm Logout</h3>
                            <p className="text-sm text-gray-300 mb-4">Are you sure you want to end your current session?</p>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button onClick={() => setShowLogoutModal(false)} className="hover:bg-neutral-200 cursor-pointer bg-neutral-50 rounded text-neutral-800 font-semibold w-full sm:w-1/2 py-2 transition">
                                    Cancel
                                </button>
                                <button onClick={handleLogout} className="bg-red-600 cursor-pointer hover:bg-red-500 text-white rounded font-semibold w-full sm:w-1/2 py-2 transition">
                                    Log Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
