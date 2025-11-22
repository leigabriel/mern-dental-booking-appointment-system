import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import { useState, useEffect } from 'react';
import authService from './services/auth.service';
import './index.css';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import GoogleCallback from './pages/GoogleCallback';
import VerifyEmail from './pages/VerifyEmail';
import UserLanding from './pages/UserLanding';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminAppointments from './pages/AdminAppointments';
import AdminDoctorManagement from './pages/AdminDoctorManagement';
import AdminCalendar from './pages/AdminCalendar';
import AdminReports from './pages/AdminReports';
import AdminServiceManagement from './pages/AdminServiceManagement';
import StaffDashboard from './pages/StaffDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import BookAppointment from './pages/BookAppointment';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    // Root redirect component
    const RootRedirect = () => {
        if (!user) {
            return <UserLanding />;
        }
        if (user.role === 'admin') {
            return <Navigate to="/admin/dashboard" replace />;
        } else if (user.role === 'staff') {
            return <Navigate to="/staff/dashboard" replace />;
        } else if (user.role === 'doctor') {
            return <Navigate to="/doctor/dashboard" replace />;
        }
        return <UserLanding />;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<RootRedirect />} />
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <PublicRoute>
                                <Register />
                            </PublicRoute>
                        }
                    />
                    <Route path="/auth/callback" element={<GoogleCallback />} />
                    <Route path="/verify-email/:token" element={<VerifyEmail />} />

                    {/* Protected Routes - User Only (exclude admin and staff) */}
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute excludeRoles={['admin', 'staff', 'doctor']}>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/book"
                        element={
                            <ProtectedRoute excludeRoles={['admin', 'staff', 'doctor']}>
                                <BookAppointment />
                            </ProtectedRoute>
                        }
                    />

                    {/* Payment Routes */}
                    <Route
                        path="/payment/:method/success/:appointment_id"
                        element={
                            <ProtectedRoute excludeRoles={['admin', 'staff', 'doctor']}>
                                <PaymentSuccess />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/payment/:method/failed/:appointment_id"
                        element={
                            <ProtectedRoute excludeRoles={['admin', 'staff', 'doctor']}>
                                <PaymentFailed />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/payment/:method/cancel/:appointment_id"
                        element={
                            <ProtectedRoute excludeRoles={['admin', 'staff', 'doctor']}>
                                <PaymentFailed />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Routes */}
                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute requiredRole="admin">
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/appointments"
                        element={
                            <ProtectedRoute requiredRole={['admin', 'staff']}>
                                <AdminAppointments />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/doctors"
                        element={
                            <ProtectedRoute requiredRole={['admin', 'staff']}>
                                <AdminDoctorManagement />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/calendar"
                        element={
                            <ProtectedRoute requiredRole={['admin', 'staff']}>
                                <AdminCalendar />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/reports"
                        element={
                            <ProtectedRoute requiredRole="admin">
                                <AdminReports />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/services"
                        element={
                            <ProtectedRoute requiredRole={['admin', 'staff']}>
                                <AdminServiceManagement />
                            </ProtectedRoute>
                        }
                    />

                    {/* Staff Routes */}
                    <Route
                        path="/staff/dashboard"
                        element={
                            <ProtectedRoute requiredRole={['staff', 'admin']}>
                                <StaffDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Doctor Routes */}
                    <Route
                        path="/doctor/dashboard"
                        element={
                            <ProtectedRoute requiredRole="doctor">
                                <DoctorDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthContext.Provider>
    );
}

export default App;
