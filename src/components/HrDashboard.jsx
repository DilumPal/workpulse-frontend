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
    const [pendingRequests, setPendingRequests] = useState([]);
    const [departmentBreakdown, setDepartmentBreakdown] = useState([]);
    const [empTypeBreakdown, setEmpTypeBreakdown] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [profileRes, statsRes, empRes, leavesRes] = await Promise.all([
                    api.get('/employees/me'),
                    api.get('/dashboard/hr-stats'),
                    api.get('/employees'),
                    api.get('/leave-requests')
                ]);

                setFirstName(profileRes.data.firstName || 'HR Manager');
                setStats(statsRes.data);

                const pending = (leavesRes.data || [])
                    .filter((req) => req.status?.toLowerCase() === 'pending')
                    .slice(0, 5);
                setPendingRequests(pending);

                const employees = empRes.data || [];
                const deptCounts = {};
                const typeCounts = {};

                employees.forEach((emp) => {
                    const dept = emp.departmentName || emp.department?.name || 'Unassigned';
                    deptCounts[dept] = (deptCounts[dept] || 0) + 1;

                    const type = emp.empType || emp.employmentType || 'Full time';
                    typeCounts[type] = (typeCounts[type] || 0) + 1;
                });

                const sortedDepts = Object.entries(deptCounts)
                    .map(([name, count]) => ({
                        name,
                        count,
                        percentage: employees.length ? Math.round((count / employees.length) * 100) : 0
                    }))
                    .sort((a, b) => b.count - a.count);

                const sortedTypes = Object.entries(typeCounts)
                    .map(([type, count]) => ({ type, count }))
                    .sort((a, b) => b.count - a.count);

                setDepartmentBreakdown(sortedDepts);
                setEmpTypeBreakdown(sortedTypes);
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
        <div className="max-w-6xl mx-auto h-full flex flex-col gap-4 overflow-hidden">
            {/* Header */}
            <div className="shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">
                    Welcome {firstName}
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                    Here is today&apos;s company overview.
                </p>
            </div>

            {error && (
                <div className="shrink-0 p-3 text-sm text-red-700 bg-red-100 rounded-md font-medium">
                    {error}
                </div>
            )}

            {/* 3 Stat Cards */}
            <div className="shrink-0 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                    onClick={() => navigate('/manage-employees')}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all"
                >
                    <p className="text-xs font-semibold text-gray-600">Total employees</p>
                    <p className="text-3xl font-bold text-gray-900 text-center my-3">
                        {stats.totalEmployees}
                    </p>
                    <p className="text-xs text-blue-600 font-medium text-right">
                        Manage Employees &rarr;
                    </p>
                </div>

                <div
                    onClick={() => navigate('/manage-leaves')}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:border-yellow-400 hover:shadow-md transition-all"
                >
                    <p className="text-xs font-semibold text-gray-600">Pending Leaves</p>
                    <p className="text-3xl font-bold text-gray-900 text-center my-3">
                        {stats.pendingLeaves}
                    </p>
                    <p className="text-xs text-blue-600 font-medium text-right">
                        Review Requests &rarr;
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <p className="text-xs font-semibold text-gray-600">On leaves today</p>
                    <p className="text-3xl font-bold text-gray-900 text-center my-3">
                        {stats.onLeaveToday}
                    </p>
                    <p className="text-xs text-gray-400 font-medium text-right">
                        Approved for today
                    </p>
                </div>
            </div>

            {/* Bottom 2-Column Overview */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left: Recent Pending Leave Requests */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col min-h-0 overflow-hidden">
                    <div className="flex items-center justify-between mb-3 shrink-0">
                        <h2 className="text-base font-bold text-gray-900">
                            Recent Pending Leave Requests
                        </h2>
                        <button
                            type="button"
                            onClick={() => navigate('/manage-leaves')}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                            View All &rarr;
                        </button>
                    </div>

                    {pendingRequests.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
                            All caught up! No pending leave requests right now.
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                            {pendingRequests.map((req) => (
                                <div
                                    key={req.leaveId}
                                    className="py-2.5 flex items-center justify-between gap-4 hover:bg-gray-50/70 px-2 rounded-lg transition-colors"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {req.employeeName || 'Unknown'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {req.employeeJobRole || 'Employee'} &bull; {req.leaveType}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-medium text-gray-700">
                                            {req.startDate === req.endDate
                                                ? req.startDate
                                                : `${req.startDate} to ${req.endDate}`}
                                        </p>
                                        {req.requestedDuration && (
                                            <span className="inline-block mt-0.5 px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                                                {req.requestedDuration}{' '}
                                                {Number(req.requestedDuration) === 1 ? 'day' : 'days'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Department Headcount & Employment Types */}
                <div className="flex flex-col gap-4 min-h-0">
                    {/* Department Breakdown */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex-1 min-h-0 flex flex-col justify-between">
                        <h2 className="text-base font-bold text-gray-900 mb-2 shrink-0">
                            Department Headcount
                        </h2>
                        {departmentBreakdown.length === 0 ? (
                            <p className="text-xs text-gray-400">No department data available.</p>
                        ) : (
                            <div className="space-y-2.5 my-auto">
                                {departmentBreakdown.map((dept) => (
                                    <div key={dept.name}>
                                        <div className="flex justify-between text-xs font-medium mb-1">
                                            <span className="text-gray-700">{dept.name}</span>
                                            <span className="text-gray-500">
                                                {dept.count} ({dept.percentage}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-blue-50 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                                style={{ width: `${dept.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Employment Type Summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 shrink-0">
                        <h2 className="text-base font-bold text-gray-900 mb-2.5">
                            Employment Types
                        </h2>
                        {empTypeBreakdown.length === 0 ? (
                            <p className="text-xs text-gray-400">No employee data available.</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                {empTypeBreakdown.map((item) => (
                                    <div
                                        key={item.type}
                                        className="py-2 px-3 rounded-lg bg-slate-50 border border-slate-100 text-center"
                                    >
                                        <p className="text-lg font-bold text-gray-900 leading-tight">
                                            {item.count}
                                        </p>
                                        <p className="text-xs font-medium text-gray-500">
                                            {item.type}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}