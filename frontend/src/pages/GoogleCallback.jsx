import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/auth.service';

const GoogleCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (isProcessing) return; // Prevent multiple executions
        
        const handleGoogleCallback = async () => {
            setIsProcessing(true);
            
            const userParam = searchParams.get('user');
            const error = searchParams.get('error');

            if (error) {
                navigate('/login?error=' + error, { replace: true });
                return;
            }

            if (userParam) {
                try {
                    const userData = JSON.parse(decodeURIComponent(userParam));
                    
                    // Save to localStorage first
                    authService.loginWithGoogle(userData);
                    
                    // Update auth context
                    login(userData);

                    // Wait 2 seconds before redirect
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    // Redirect based on role
                    if (userData.role === 'admin') {
                        navigate('/admin/dashboard', { replace: true });
                    } else if (userData.role === 'staff') {
                        navigate('/staff/dashboard', { replace: true });
                    } else {
                        navigate('/', { replace: true });
                    }
                } catch (error) {
                    console.error('Error parsing user data:', error);
                    navigate('/login?error=invalid_data', { replace: true });
                }
            } else {
                navigate('/login', { replace: true });
            }
        };

        handleGoogleCallback();
    }, []);

    // Show minimal loading indicator
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Completing sign in...</p>
            </div>
        </div>
    );
};

export default GoogleCallback;
