import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function HrDashboard() {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [stats, setStats] = useState({
        totalEmployees: 0,
        pendingLeaves: 0,
        onLeaveToday: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [profileRes, statsRes] = await Promise.all([
                    api.get('/employees/me'),
                    api.get('/dashboard/hr-stats')
                ]);
                setFirstName(profileRes.data.firstName || 'HR Manager');
                setStats(statsRes.data);
                setError('');
            } catch (err) {
                setError(err.response?.data?.details || 'Failed to load HR dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading HR dashboard...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome {firstName}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Here is today&apos;s company overview.
                </p>
            </div>

            {error && (
                <div className="p-4 text-red-700 bg-red-100 rounded-md font-medium">
                    {error}
                </div>
            )}

            {/* 3 Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Employees */}
                <div
                    onClick={() => navigate('/manage-employees')}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all"
                >
                    <p className="text-sm font-semibold text-gray-600">Total employees</p>
                    <p className="text-4xl font-bold text-gray-900 text-center my-6">
                        {stats.totalEmployees}
                    </p>
                    <p className="text-xs text-blue-600 font-medium text-right">
                        Manage Employees &rarr;
                    </p>
                </div>

                {/* Pending Leaves */}
                <div
                    onClick={() => navigate('/manage-leaves')}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:border-yellow-400 hover:shadow-md transition-all"
                >
                    <p className="text-sm font-semibold text-gray-600">Pending Leaves</p>
                    <p className="text-4xl font-bold text-gray-900 text-center my-6">
                        {stats.pendingLeaves}
                    </p>
                    <p className="text-xs text-blue-600 font-medium text-right">
                        Review Requests &rarr;
                    </p>
                </div>

                {/* On Leaves Today */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <p className="text-sm font-semibold text-gray-600">On leaves today</p>
                    <p className="text-4xl font-bold text-gray-900 text-center my-6">
                        {stats.onLeaveToday}
                    </p>
                    <p className="text-xs text-gray-400 font-medium text-right">
                        Approved for today
                    </p>
                </div>
            </div>
        </div>
    );
}