import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole, excludeRoles }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check if user role is excluded from this route
    if (excludeRoles) {
        if (Array.isArray(excludeRoles)) {
            if (excludeRoles.includes(user.role)) {
                // Redirect admin to their dashboard
                if (user.role === 'admin') {
                    return <Navigate to="/admin/dashboard" replace />;
                } else if (user.role === 'staff') {
                    return <Navigate to="/staff/dashboard" replace />;
                }
                return <Navigate to="/" replace />;
            }
        } else {
            if (user.role === excludeRoles) {
                if (user.role === 'admin') {
                    return <Navigate to="/admin/dashboard" replace />;
                } else if (user.role === 'staff') {
                    return <Navigate to="/staff/dashboard" replace />;
                }
                return <Navigate to="/" replace />;
            }
        }
    }

    if (requiredRole) {
        // If requiredRole is an array, check if user role is in the array
        if (Array.isArray(requiredRole)) {
            if (!requiredRole.includes(user.role)) {
                // Redirect to appropriate dashboard
                if (user.role === 'admin') {
                    return <Navigate to="/admin/dashboard" replace />;
                } else if (user.role === 'staff') {
                    return <Navigate to="/staff/dashboard" replace />;
                }
                return <Navigate to="/" replace />;
            }
        } else {
            // If requiredRole is a string, check if user role matches
            if (user.role !== requiredRole) {
                // Redirect to appropriate dashboard
                if (user.role === 'admin') {
                    return <Navigate to="/admin/dashboard" replace />;
                } else if (user.role === 'staff') {
                    return <Navigate to="/staff/dashboard" replace />;
                }
                return <Navigate to="/" replace />;
            }
        }
    }

    return children;
};

export default ProtectedRoute;
