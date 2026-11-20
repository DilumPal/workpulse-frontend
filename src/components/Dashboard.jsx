import { useEffect, useState, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

export default function Dashboard() {
    const { user } = useContext(AuthContext);
    const { profile } = useOutletContext() || {};
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [searchDate, setSearchDate] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const fetchAttendance = async () => {
        try {
            const response = await api.get('/attendance-logs/me');
            setAttendanceHistory(response.data);
        } catch (err) {
            console.error("Failed to fetch attendance", err);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    const handleCheckIn = async () => {
        setError('');
        setSuccessMessage('');
        try {
            await api.post('/attendance-logs/check-in');
            setSuccessMessage('Successfully checked in for today!');
            fetchAttendance();
        } catch (err) {
            setError(err.response?.data?.details || 'Failed to check in.');
        }
    };

    const handleCheckOut = async () => {
        setError('');
        setSuccessMessage('');
        try {
            await api.put('/attendance-logs/check-out');
            setSuccessMessage('Successfully checked out.');
            fetchAttendance();
        } catch (err) {
            setError(err.response?.data?.details || 'Failed to check out.');
        }
    };

    // Calculate Half Day / Full Day dynamically
    const getDisplayStatus = (log) => {
        if (log.status === 'Checked Out' && log.checkInTime && log.checkOutTime) {
            const checkIn = new Date(log.checkInTime);
            const checkOut = new Date(log.checkOutTime);
            const hoursWorked = (checkOut - checkIn) / (1000 * 60 * 60);
            
            return hoursWorked >= 8 ? 'Checked Out (Full Day)' : 'Checked Out (Half Day)';
        }
        return log.status; 
    };

    const getStatusStyle = (status) => {
        if (status.includes('Full Day')) return 'bg-green-100 text-green-800';
        if (status.includes('Half Day')) return 'bg-orange-100 text-orange-800';
        if (status === 'Checked Out') return 'bg-gray-100 text-gray-800';
        return 'bg-blue-100 text-blue-800'; // Checked In
    };

    // Filter logic
    const displayedHistory = attendanceHistory.filter((log) => {
        if (searchDate) {
            return log.workDate === searchDate;
        }
        const today = new Date();
        const logDate = new Date(log.workDate);
        return logDate.getMonth() === today.getMonth() && logDate.getFullYear() === today.getFullYear();
    });

    // Dynamic Time Greeting logic
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const displayName = profile?.firstName || user?.email?.split('@')[0] || 'User';

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Dynamic Greeting */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    {getGreeting()}, <span className="capitalize">{displayName}</span>..!
                </h1>
                <p className="text-gray-500 mt-1">Here is your attendance overview.</p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Today&apos;s Attendance</h2>
            
            {error && <div className="p-4 text-red-700 bg-red-100 rounded-md font-medium">{error}</div>}
            {successMessage && <div className="p-4 text-green-700 bg-green-100 rounded-md font-medium">{successMessage}</div>}

            <div className="p-6 bg-white rounded-lg shadow-sm">
                <div className="flex space-x-4">
                    <button onClick={handleCheckIn} className="px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 font-medium">
                        Check In
                    </button>
                    <button onClick={handleCheckOut} className="px-6 py-3 text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 font-medium">
                        Check Out
                    </button>
                </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-4 sm:space-y-0">
                    <h3 className="text-lg font-bold text-gray-900">My Punch History</h3>
                    
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">Search Date:</label>
                        <input 
                            type="date" 
                            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                            value={searchDate}
                            onChange={(e) => setSearchDate(e.target.value)}
                        />
                        {searchDate && (
                            <button 
                                onClick={() => setSearchDate('')}
                                className="text-sm text-gray-500 hover:text-gray-700 underline"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Check In</th>
                                <th className="px-6 py-3">Check Out</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedHistory.map((log) => {
                                const displayStatus = getDisplayStatus(log);
                                return (
                                    <tr key={log.logId || log.workDate} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{log.workDate}</td>
                                        <td className="px-6 py-4">{log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString() : '--'}</td>
                                        <td className="px-6 py-4">{log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString() : '--'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(displayStatus)}`}>
                                                {displayStatus}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {displayedHistory.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        {searchDate ? "No attendance records found for this date." : "No attendance records found for this month."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}