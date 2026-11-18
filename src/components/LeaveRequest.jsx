import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function LeaveRequest() {
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [leaveForm, setLeaveForm] = useState({
        leaveType: 'Annual Leave',
        startDate: '',
        endDate: '',
        duration: 'Full Day', // Defaults to Full Day
        reason: ''
    });

    // Check if the exact same date is selected for start and end
    const isSingleDay = leaveForm.startDate && leaveForm.endDate && (leaveForm.startDate === leaveForm.endDate);

    useEffect(() => {
        // Automatically switch back to 'Full Day' if the user selects a multi-day range 
        // after having previously selected 'Half Day'
        if (!isSingleDay && leaveForm.duration === 'Half Day') {
            setLeaveForm(prev => ({ ...prev, duration: 'Full Day' }));
        }
    }, [isSingleDay, leaveForm.duration]);

    const handleLeaveSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        try {
            await api.post('/leave-requests', leaveForm);
            setSuccessMessage('Leave request submitted successfully!');
            setLeaveForm({ leaveType: 'Annual Leave', startDate: '', endDate: '', duration: 'Full Day', reason: '' });
        } catch (err) {
            setError(err.response?.data?.details || 'Failed to submit leave request.');
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Leave Request</h2>

            {error && <div className="p-4 text-red-700 bg-red-100 rounded-md font-medium">{error}</div>}
            {successMessage && <div className="p-4 text-green-700 bg-green-100 rounded-md font-medium">{successMessage}</div>}

            <div className="p-8 bg-white rounded-lg shadow-sm">
                <form onSubmit={handleLeaveSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                        <select 
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                            value={leaveForm.leaveType}
                            onChange={(e) => setLeaveForm({...leaveForm, leaveType: e.target.value})}
                        >
                            <option value="Annual Leave">Annual Leave</option>
                            <option value="Sick Leave">Sick Leave</option>
                            <option value="Casual Leave">Casual Leave</option>
                        </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input 
                                type="date" required
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                                value={leaveForm.startDate}
                                onChange={(e) => setLeaveForm({...leaveForm, startDate: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input 
                                type="date" required
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                                value={leaveForm.endDate}
                                onChange={(e) => setLeaveForm({...leaveForm, endDate: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* New Full Day / Half Day Toggle */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                disabled={!isSingleDay}
                                onClick={() => setLeaveForm({...leaveForm, duration: 'Full Day'})}
                                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                                    leaveForm.duration === 'Full Day' 
                                        ? 'bg-blue-600 text-white shadow-sm' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                } ${!isSingleDay ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Full Day
                            </button>
                            <button
                                type="button"
                                disabled={!isSingleDay}
                                onClick={() => setLeaveForm({...leaveForm, duration: 'Half Day'})}
                                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                                    leaveForm.duration === 'Half Day' 
                                        ? 'bg-blue-600 text-white shadow-sm' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                } ${!isSingleDay ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Half Day
                            </button>
                        </div>
                        {!isSingleDay && leaveForm.startDate && leaveForm.endDate && (
                            <p className="mt-2 text-sm text-gray-500">
                                Multiple days selected. Leave will be recorded as full days.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                        <textarea 
                            required rows="4"
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                            value={leaveForm.reason}
                            onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                        ></textarea>
                    </div>

                    <button type="submit" className="w-full px-4 py-3 mt-4 text-white bg-blue-600 rounded-md hover:bg-blue-700 font-medium transition-colors">
                        Submit Leave Request
                    </button>
                </form>
            </div>
        </div>
    );
}