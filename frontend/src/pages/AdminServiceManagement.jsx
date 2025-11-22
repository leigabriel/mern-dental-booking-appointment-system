import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import api from '../services/api';
import serviceService from '../services/service.service';
import { 
    FaPlus,
    FaEdit,
    FaTrash,
    FaTooth,
    FaChartLine,
    FaCalendarAlt,
    FaCalendarCheck,
    FaUserMd,
    FaBriefcaseMedical,
    FaSignOutAlt,
    FaExclamationTriangle
} from 'react-icons/fa';

const AdminServiceManagement = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [selectedService, setSelectedService] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [errors, setErrors] = useState([]);
    
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        duration_mins: ''
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await serviceService.getAllServices();
            setServices(response.data);
        } catch (err) {
            console.error('Failed to fetch services:', err);
            setMessage({ type: 'error', text: 'Failed to load services' });
        } finally {
            setLoading(false);
        }
    };

    const openModal = (mode, service = null) => {
        setModalMode(mode);
        setSelectedService(service);
        setErrors([]);
        setMessage({ type: '', text: '' });
        
        if (mode === 'add') {
            setFormData({ name: '', price: '', duration_mins: '' });
        } else if (mode === 'edit' && service) {
            setFormData({
                name: service.name,
                price: service.price,
                duration_mins: service.duration_mins
            });
        }
        
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedService(null);
        setFormData({ name: '', price: '', duration_mins: '' });
        setErrors([]);
    };

    const validateForm = () => {
        const newErrors = [];
        
        if (!formData.name || formData.name.trim() === '') {
            newErrors.push('Service name is required');
        }
        
        if (!formData.price || parseFloat(formData.price) <= 0) {
            newErrors.push('Valid price is required');
        }
        
        if (!formData.duration_mins || parseInt(formData.duration_mins) <= 0) {
            newErrors.push('Valid duration is required');
        }
        
        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            const serviceData = {
                name: formData.name.trim(),
                price: parseFloat(formData.price),
                duration_mins: parseInt(formData.duration_mins)
            };

            if (modalMode === 'add') {
                await serviceService.createService(serviceData);
                setMessage({ type: 'success', text: 'Service added successfully!' });
            } else if (modalMode === 'edit' && selectedService) {
                await serviceService.updateService(selectedService.id, serviceData);
                setMessage({ type: 'success', text: 'Service updated successfully!' });
            }

            fetchServices();
            closeModal();
            
            // Clear message after 3 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            console.error('Service operation failed:', err);
            const errorMsg = err.response?.data?.message || 'Operation failed. Please try again.';
            setErrors([errorMsg]);
        }
    };

    const openDeleteModal = (service) => {
        setSelectedService(service);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setSelectedService(null);
    };

    const handleDelete = async () => {
        if (!selectedService) return;

        try {
            await serviceService.deleteService(selectedService.id);
            setMessage({ type: 'success', text: 'Service deleted successfully!' });
            fetchServices();
            closeDeleteModal();
            
            // Clear message after 3 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            console.error('Delete failed:', err);
            const errorMsg = err.response?.data?.message || 'Failed to delete service';
            setMessage({ type: 'error', text: errorMsg });
            closeDeleteModal();
            
            // Clear message after 3 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const handleLogout = () => {
        setShowLogoutModal(false);
        logout();
        navigate('/login');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <AdminSidebar currentPage="services" userRole={user?.role} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
                    <header className="mb-10">
                        <h1 className="text-8xl font-extrabold text-gray-900">Manage Services</h1>
                        <p className="text-lg text-gray-600 mt-1">Add, edit, and delete clinic services.</p>
                    </header>

                    {/* Success/Error Messages */}
                    {message.text && (
                        <div 
                            className={`p-4 mb-6 rounded-lg border shadow-sm ${
                                message.type === 'success' 
                                    ? 'bg-green-100 text-green-700 border-green-300' 
                                    : 'bg-red-100 text-red-700 border-red-300'
                            }`}
                        >
                            <strong className="font-bold">{message.type === 'success' ? 'Success!' : 'Error!'}</strong>
                            <span className="ml-2">{message.text}</span>
                        </div>
                    )}

                    {/* Service List */}
                    <section className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Service List</h2>
                            <button 
                                onClick={() => openModal('add')}
                                className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <FaPlus /> Add New Service
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                <p className="mt-4 text-gray-600">Loading services...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Name</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price (PHP)</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration (Mins)</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {services.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-3 py-4 text-center text-gray-500">No services found.</td>
                                            </tr>
                                        ) : (
                                            services.map(service => (
                                                <tr key={service.id} className="hover:bg-gray-50">
                                                    <td className="px-3 py-4 text-sm font-medium text-gray-900">{service.id}</td>
                                                    <td className="px-3 py-4 text-sm text-gray-600">{service.name}</td>
                                                    <td className="px-3 py-4 text-sm text-gray-600">₱{parseFloat(service.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                                    <td className="px-3 py-4 text-sm text-gray-600">{service.duration_mins}</td>
                                                    <td className="px-3 py-4 text-sm space-x-2 whitespace-nowrap">
                                                        <button
                                                            onClick={() => openModal('edit', service)}
                                                            className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                                                        >
                                                            <FaEdit /> Edit
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteModal(service)}
                                                            className="text-red-600 hover:text-red-800 font-medium ml-2 inline-flex items-center gap-1"
                                                        >
                                                            <FaTrash /> Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </main>
            </div>

            {/* Service Modal */}
            {showModal && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={closeModal}
                >
                    <div 
                        className="bg-white w-full max-w-lg p-6 rounded-xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                            {modalMode === 'add' ? 'Add New Service' : `Edit Service: ${selectedService?.name}`}
                        </h2>

                        {errors.length > 0 && (
                            <div className="p-3 mb-4 rounded-lg bg-red-100 text-red-700 border border-red-300">
                                <ul className="list-disc pl-5 m-0">
                                    {errors.map((error, idx) => (
                                        <li key={idx}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Service Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                                        Price (PHP)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        id="price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="duration_mins" className="block text-sm font-medium text-gray-700">
                                        Duration (in minutes)
                                    </label>
                                    <input
                                        type="number"
                                        id="duration_mins"
                                        name="duration_mins"
                                        value={formData.duration_mins}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button 
                                    type="button" 
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    {modalMode === 'add' ? 'Add Service' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={closeDeleteModal}
                >
                    <div 
                        className="bg-white w-full max-w-sm p-6 rounded-lg shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center mb-4">
                            <span className="inline-block p-6 rounded-full bg-red-100 text-red-600">
                                <FaExclamationTriangle className="text-2xl" />
                            </span>
                        </div>

                        <h3 className="text-lg font-semibold text-center text-gray-800 mb-2">Confirm Deletion</h3>

                        <p className="text-sm text-gray-600 text-center mb-6">
                            Are you sure you want to delete "<strong>{selectedService?.name}</strong>"?<br />
                            This action cannot be undone.
                        </p>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={closeDeleteModal}
                                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium text-sm shadow-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
        </div>
    );
};

export default AdminServiceManagement;
