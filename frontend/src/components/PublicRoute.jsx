import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PublicRoute = ({ children }) => {
    const { user } = useAuth();

    if (user) {
        // Redirect based on role
        if (user.role === 'admin') {
            return <Navigate to="/admin/dashboard" replace />;
        } else if (user.role === 'staff') {
            return <Navigate to="/staff/dashboard" replace />;
        }
        return <Navigate to="/profile" replace />;
    }

    return children;
};

export default PublicRoute;
