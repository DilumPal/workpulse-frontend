import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function ManageDepartments() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Modal & Form state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/departments');
            setDepartments(response.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.details || 'Failed to load departments.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const openCreateModal = () => {
        setEditingDept(null);
        setFormData({ name: '', description: '' });
        setError('');
        setIsModalOpen(true);
    };

    const openEditModal = (dept) => {
        setEditingDept(dept);
        setFormData({
            name: dept.name || '',
            description: dept.description || ''
        });
        setError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingDept(null);
        setFormData({ name: '', description: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        try {
            if (editingDept) {
                const id = editingDept.departmentId || editingDept.id;
                const response = await api.put(`/departments/${id}`, formData);
                setDepartments(prev =>
                    prev.map(d => ((d.departmentId || d.id) === id ? response.data : d))
                );
                setSuccessMessage(`Department "${formData.name}" updated successfully.`);
            } else {
                const response = await api.post('/departments', formData);
                setDepartments(prev => [...prev, response.data]);
                setSuccessMessage(`Department "${formData.name}" created successfully.`);
            }
            closeModal();
        } catch (err) {
            setError(err.response?.data?.details || err.response?.data?.message || 'Failed to save department.');
        }
    };

    const handleDelete = async (dept) => {
        const id = dept.departmentId || dept.id;
        if (!window.confirm(`Are you sure you want to delete "${dept.name}"?`)) return;

        setError('');
        setSuccessMessage('');
        try {
            await api.delete(`/departments/${id}`);
            setDepartments(prev => prev.filter(d => (d.departmentId || d.id) !== id));
            setSuccessMessage(`Department "${dept.name}" deleted.`);
        } catch (err) {
            setError(err.response?.data?.details || 'Failed to delete department. Make sure no employees are assigned to it.');
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Manage Departments</h2>
                <button
                    onClick={openCreateModal}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm"
                >
                    + Add Department
                </button>
            </div>

            {error && <div className="p-4 text-red-700 bg-red-100 rounded-md font-medium">{error}</div>}
            {successMessage && <div className="p-4 text-green-700 bg-green-100 rounded-md font-medium">{successMessage}</div>}

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading departments...</div>
                ) : departments.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No departments found. Click "+ Add Department" to create one.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-semibold">
                                    <th className="py-3 px-6">ID</th>
                                    <th className="py-3 px-6">Department Name</th>
                                    <th className="py-3 px-6">Description</th>
                                    <th className="py-3 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-sm">
                                {departments.map((dept) => {
                                    const id = dept.departmentId || dept.id;
                                    return (
                                        <tr key={id} className="hover:bg-gray-50">
                                            <td className="py-4 px-6 text-gray-500 font-mono">#{id}</td>
                                            <td className="py-4 px-6 font-semibold text-gray-900">{dept.name}</td>
                                            <td className="py-4 px-6 text-gray-600 max-w-md">
                                                {dept.description || <span className="text-gray-400 italic">No description</span>}
                                            </td>
                                            <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                                                <button
                                                    onClick={() => openEditModal(dept)}
                                                    className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(dept)}
                                                    className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            {editingDept ? 'Edit Department' : 'Create New Department'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Department Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={100}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Engineering"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    maxLength={1000}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief overview of the department..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                >
                                    {editingDept ? 'Save Changes' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}