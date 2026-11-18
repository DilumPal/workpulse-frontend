import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function ManageLeaves() {
    const [requests, setRequests] = useState([]);
    const [filter, setFilter] = useState('Pending');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionMessage, setActionMessage] = useState('');

    const fetchAllRequests = async () => {
        try {
            setLoading(true);
            const response = await api.get('/leave-requests');
            setRequests(response.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.details || 'Failed to load leave requests. Make sure you have HR/Admin access.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllRequests();
    }, []);

    const handleStatusUpdate = async (leaveId, newStatus) => {
        setError('');
        setActionMessage('');
        try {
            const response = await api.put(`/leave-requests/${leaveId}/status`, {
                status: newStatus
            });

            // Update the local list with the updated request returned from the backend
            setRequests(prev =>
                prev.map(req => (req.leaveId === leaveId ? response.data : req))
            );
            setActionMessage(`Leave request #${leaveId} marked as ${newStatus}.`);
        } catch (err) {
            setError(err.response?.data?.details || `Failed to ${newStatus.toLowerCase()} leave request.`);
        }
    };

    const filteredRequests = filter === 'All'
        ? requests
        : requests.filter(req => req.status?.toLowerCase() === filter.toLowerCase());

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Manage Leave Requests</h2>

                {/* Filter Tabs */}
                <div className="flex space-x-2 bg-white p-1 rounded-lg shadow-sm border">
                    {['Pending', 'Approved', 'Rejected', 'All'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                filter === tab
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {error && <div className="p-4 text-red-700 bg-red-100 rounded-md font-medium">{error}</div>}
            {actionMessage && <div className="p-4 text-green-700 bg-green-100 rounded-md font-medium">{actionMessage}</div>}

            <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading leave requests...</div>
                ) : filteredRequests.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No {filter.toLowerCase()} leave requests found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-semibold">
                                    <th className="py-3 px-4">Employee</th>
                                    <th className="py-3 px-4">Type</th>
                                    <th className="py-3 px-4">Dates</th>
                                    <th className="py-3 px-4">Reason</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Reviewed By</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-sm">
                                {filteredRequests.map((req) => (
                                    <tr key={req.leaveId} className="hover:bg-gray-50">
                                        <td className="py-4 px-4 font-medium text-gray-900">
                                            {req.employeeName || 'Unknown'}
                                        </td>
                                        <td className="py-4 px-4 text-gray-700">
                                            {req.leaveType}
                                            {req.requestedDuration && (
                                                <span className="block text-xs text-gray-400">
                                                    {req.requestedDuration}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-gray-700 whitespace-nowrap">
                                            {req.startDate === req.endDate
                                                ? req.startDate
                                                : `${req.startDate} to ${req.endDate}`}
                                        </td>
                                        <td className="py-4 px-4 text-gray-600 max-w-xs truncate" title={req.reason}>
                                            {req.reason}
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(req.status)}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-gray-500">
                                            {req.reviewedBy || '--'}
                                        </td>
                                        <td className="py-4 px-4 text-right whitespace-nowrap">
                                            {req.status?.toLowerCase() === 'pending' ? (
                                                <div className="inline-flex space-x-2">
                                                    <button
                                                        onClick={() => handleStatusUpdate(req.leaveId, 'Approved')}
                                                        className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(req.leaveId, 'Rejected')}
                                                        className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">Completed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}