import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import doctorService from '../services/doctor.service';

const AdminDoctorManagement = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState({ id: null, name: '' });
    const [errors, setErrors] = useState([]);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        specialty: '',
        email: '',
        username: '',
        password: ''
    });

    useEffect(() => {
        loadDoctors();
    }, []);

    const loadDoctors = async () => {
        try {
            setLoading(true);
            console.log('Loading doctors...');
            const data = await doctorService.getAll();
            console.log('Doctors loaded:', data);
            setDoctors(Array.isArray(data) ? data : []);
            // preserve any existing message (don't clear here so success messages can persist)
        } catch (error) {
            console.error('Error loading doctors:', error);
            console.error('Error response:', error.response);
            setDoctors([]);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || error.message || 'Failed to load doctors'
            });
        } finally {
            setLoading(false);
        }
    };

    const openModal = (mode, doctor = null) => {
        setModalMode(mode);
        setSelectedDoctor(doctor);
        setErrors([]);
        setMessage({ type: '', text: '' });

        if (mode === 'add') {
            setFormData({
                name: '',
                specialty: '',
                email: '',
                username: '',
                password: ''
            });
        } else if (mode === 'edit' && doctor) {
            setFormData({
                name: doctor.name || '',
                specialty: doctor.specialty || '',
                email: doctor.email || '',
                username: doctor.username || '',
                password: ''
            });
        }
        setShowModal(true);
        document.body.classList.add('overflow-hidden');
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedDoctor(null);
        setErrors([]);
        document.body.classList.remove('overflow-hidden');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        const validationErrors = [];

        if (!formData.name.trim()) validationErrors.push('Doctor name is required');
        if (!formData.specialty.trim()) validationErrors.push('Specialty is required');
        if (!formData.email.trim()) validationErrors.push('Email is required');
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            validationErrors.push('Please enter a valid email address');
        }

        if (modalMode === 'add') {
            if (!formData.username.trim()) validationErrors.push('Username is required');
            if (!formData.password) validationErrors.push('Password is required');
            if (formData.password && formData.password.length < 6) {
                validationErrors.push('Password must be at least 6 characters');
            }
        } else if (modalMode === 'edit') {
            if (formData.password && formData.password.length < 6) {
                validationErrors.push('Password must be at least 6 characters if provided');
            }
        }

        setErrors(validationErrors);
        return validationErrors.length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setErrors([]);

        if (!validateForm()) {
            return;
        }

        try {
            const submitData = {
                name: formData.name,
                specialty: formData.specialty,
                email: formData.email,
                username: formData.username || undefined,
                password: formData.password || undefined
            };

            if (modalMode === 'add') {
                await doctorService.create(submitData);
                setMessage({ type: 'success', text: 'Doctor added successfully!' });
            } else if (modalMode === 'edit' && selectedDoctor) {
                await doctorService.update(selectedDoctor.id, submitData);
                setMessage({ type: 'success', text: 'Doctor updated successfully!' });
            }

            closeModal();
            loadDoctors();

            // Clear message after 5 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Operation failed';
            setErrors([errorMessage]);
        }
    };

    const openDeleteModal = (doctor) => {
        setDeleteTarget({ id: doctor.id, name: doctor.name });
        setShowDeleteModal(true);
        document.body.classList.add('overflow-hidden');
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setDeleteTarget({ id: null, name: '' });
        document.body.classList.remove('overflow-hidden');
    };

    const handleDelete = async () => {
        try {
            await doctorService.delete(deleteTarget.id);
            setMessage({ type: 'success', text: `Doctor "${deleteTarget.name}" deleted successfully!` });
            closeDeleteModal();
            loadDoctors();

            // Clear message after 5 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to delete doctor'
            });
            closeDeleteModal();
        }
    };

    const handleLogout = () => {
        setShowLogoutModal(false);
        logout();
        navigate('/login');
    };

    return (
        <div className="bg-gray-100">
            <div className="flex min-h-screen">
                {/* Sidebar */}
                <AdminSidebar currentPage="doctors" userRole={user?.role} />

                {/* Main Content */}
                <div className="flex-1 flex flex-col lg:flex-row">
                    <main className="flex-1 p-6 sm:p-10 overflow-y-auto h-screen">
                        <header className="mb-10">
                            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900">Manage Doctors</h1>
                            <p className="text-lg text-gray-600 mt-1">Add, edit, and delete doctor profiles.</p>
                        </header>

                        {/* Flash Message */}
                        {message.text && (
                            <div className={`p-4 mb-6 rounded-lg border shadow-sm ${
                                message.type === 'success'
                                    ? 'bg-green-100 text-green-700 border-green-300'
                                    : 'bg-red-100 text-red-700 border-red-300'
                            }`} role="alert">
                                <strong className="font-bold">{message.type === 'success' ? 'Success! ' : 'Error! '}</strong>
                                <span>{message.text}</span>
                            </div>
                        )}

                        {/* Doctor List */}
                        <section className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Doctor List</h2>
                                <button
                                    type="button"
                                    onClick={() => openModal('add')}
                                    className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                                    <i className="fas fa-plus mr-1"></i> Add New Doctor
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="7" className="px-3 py-4 text-center text-gray-500">
                                                    Loading doctors...
                                                </td>
                                            </tr>
                                        ) : doctors.length > 0 ? (
                                            doctors.map((doctor) => (
                                                <tr key={doctor.id} className="hover:bg-gray-50">
                                                    <td className="px-3 py-4 text-sm font-medium text-gray-900">{doctor.id}</td>
                                                    <td className="px-3 py-4 text-sm text-gray-600">{doctor.name}</td>
                                                    <td className="px-3 py-4 text-sm text-gray-600">{doctor.specialty}</td>
                                                    <td className="px-3 py-4 text-sm text-gray-600">{doctor.email}</td>
                                                    <td className="px-3 py-4 text-sm text-gray-600">
                                                        {doctor.user_id ? (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                <i className="fas fa-user-check mr-1"></i>
                                                                {doctor.username || 'Linked'}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                                <i className="fas fa-user-slash mr-1"></i>
                                                                No Account
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-4 text-sm">
                                                        <span
                                                            role="button"
                                                            onClick={async () => {
                                                                try {
                                                                    // Toggle availability (if is_available is 0 => become available)
                                                                    const newStatus = doctor.is_available === 0;
                                                                    await doctorService.updateAvailability(doctor.id, newStatus);
                                                                    setMessage({
                                                                        type: 'success',
                                                                        text: `Doctor availability updated to ${newStatus ? 'Available' : 'Unavailable'}`
                                                                    });
                                                                    // Refresh list but preserve current message (loadDoctors no longer clears messages)
                                                                    await loadDoctors();
                                                                    // Auto-clear message after a short delay
                                                                    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
                                                                } catch (error) {
                                                                    setMessage({
                                                                        type: 'error',
                                                                        text: error.response?.data?.message || 'Failed to update availability'
                                                                    });
                                                                }
                                                            }}
                                                            className={`cursor-pointer inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                                                                doctor.is_available !== 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                            }`}
                                                        >
                                                            {doctor.is_available !== 0 ? 'Available' : 'Unavailable'}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-4 text-sm space-x-2 whitespace-nowrap">
                                                        <button
                                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                                            onClick={() => openModal('edit', doctor)}>
                                                            Edit
                                                        </button>
                                                        {user?.role === 'admin' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => openDeleteModal(doctor)}
                                                                className="text-red-600 hover:text-red-800 font-medium ml-2">
                                                                Delete
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="px-3 py-4 text-center text-gray-500">
                                                    No doctors found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </main>
                </div>
            </div>

            {/* Doctor Modal */}
            {showModal && (
                <div className="modal fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => e.target.classList.contains('modal') && closeModal()}>
                    <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                            {modalMode === 'add' ? 'Add New Doctor' : `Edit Doctor: ${selectedDoctor?.name}`}
                        </h2>

                        {/* Validation Errors */}
                        {errors.length > 0 && (
                            <div className="p-3 mb-4 rounded-lg bg-red-100 text-red-700 border border-red-300">
                                <ul className="list-disc pl-5 m-0">
                                    {errors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Doctor Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">Specialty</label>
                                    <input
                                        type="text"
                                        id="specialty"
                                        name="specialty"
                                        value={formData.specialty}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600"
                                    />
                                </div>

                                {/* Account Fields */}
                                <div className="border-t pt-4 mt-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Login Account</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                                            <input
                                                type="text"
                                                id="username"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleInputChange}
                                                required={modalMode === 'add'}
                                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Used for doctor login</p>
                                        </div>

                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                            <input
                                                type="password"
                                                id="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                required={modalMode === 'add'}
                                                minLength="6"
                                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                {modalMode === 'add' ? 'Minimum 6 characters' : 'Leave blank to keep current password'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                                    {modalMode === 'add' ? 'Add Doctor' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => e.target.classList.contains('fixed') && closeDeleteModal()}>
                    <div className="bg-white w-full max-w-sm p-6 rounded-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center mb-4">
                            <span className="inline-block p-6 rounded-full bg-red-100 text-red-600">
                                <i className="fas fa-exclamation-triangle text-2xl"></i>
                            </span>
                        </div>

                        <h3 className="text-lg font-semibold text-center text-gray-800 mb-2">Confirm Deletion</h3>

                        <p className="text-sm text-gray-600 text-center mb-6">
                            Are you sure you want to delete "<strong>{deleteTarget.name}</strong>"?<br />
                            This action cannot be undone.
                        </p>

                        <div className="flex justify-center gap-4">
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium text-sm">
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium text-sm shadow-sm">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => e.target.classList.contains('fixed') && setShowLogoutModal(false)}>
                    <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="mb-4 text-red-500 text-5xl">
                                <i className="fas fa-right-from-bracket"></i>
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-800">Confirm Logout</h3>
                        </div>

                        <p className="text-gray-600 text-center mb-8">
                            Are you sure you want to logout? This will end your current session.
                        </p>

                        <div className="flex justify-center gap-4">
                            <button
                                type="button"
                                onClick={() => setShowLogoutModal(false)}
                                className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition duration-150 font-medium">
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-150 font-medium shadow-md">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Font Awesome */}
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet" />
        </div>
    );
};

export default AdminDoctorManagement;
