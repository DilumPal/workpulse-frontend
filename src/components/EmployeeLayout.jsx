import { useContext, useEffect, useState } from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

export default function EmployeeLayout() {
    const { user, logout } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);

    console.log("Auth user:", user, "Profile:", profile);
    const userRole = (user?.role || profile?.role || '').toUpperCase();
    const isAdmin = userRole.includes('ADMIN');
    const isHr = userRole.includes('HR');

    useEffect(() => {
        // Admins do not have an employee profile page, so skip fetching /employees/me
        if (isAdmin) return;

        const fetchMyProfile = async () => {
            try {
                const response = await api.get('/employees/me');
                setProfile(response.data);
            } catch (err) {
                console.error("Failed to load profile data", err);
            }
        };
        fetchMyProfile();
    }, [isAdmin]);

    const displayName = profile
        ? `${profile.firstName} ${profile.lastName}`
        : user?.email?.split('@')[0];

    const navLinkStyle = ({ isActive }) =>
        `block px-4 py-3 rounded-md font-medium transition-colors ${
            isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
        }`;

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Left Sidebar */}
            <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
                <div className="p-6 border-b flex flex-col items-center">
                    <h1 className="text-2xl font-bold text-blue-600 w-full text-left mb-6">WorkPulse</h1>

                    {isAdmin ? (
                        <div className="w-full text-left">
                            <span className="inline-block px-3 py-1 text-xs font-bold text-red-700 bg-red-100 rounded-full uppercase">
                                System Admin
                            </span>
                            <p className="text-sm text-gray-500 mt-2 truncate">{user?.email}</p>
                        </div>
                    ) : (
                        <>
                            <Link to="/profile" className="block relative group rounded-full">
                                <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-md group-hover:border-blue-100 transition-all">
                                    {profile?.profilePhotoUrl ? (
                                        <img src={profile.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl text-gray-500 font-bold bg-gray-200 capitalize">
                                            {displayName?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                            </Link>

                            <div className="mt-4 text-center">
                                <p className="font-bold text-gray-900 capitalize">{displayName}</p>
                                <p className="text-sm text-gray-500 font-medium mt-1">
                                    {profile?.jobRole || (isHr ? 'HR Manager' : 'Employee')}
                                </p>
                            </div>
                        </>
                    )}
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {/* Standard Employee & HR Manager Links */}
                    {!isAdmin && (
                        <>
                            <NavLink to="/dashboard" className={navLinkStyle}>
                                Attendance Dashboard
                            </NavLink>
                            <NavLink to="/directory" className={navLinkStyle}>
                                Staff Directory
                            </NavLink>
                            <NavLink to="/leave-request" className={navLinkStyle}>
                                Leave Request
                            </NavLink>
                        </>
                    )}

                    {/* HR Manager Controls */}
                    {isHr && (
                        <div className="pt-4 mt-4 border-t border-gray-200 space-y-2">
                            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                HR Management
                            </p>
                            <NavLink to="/manage-leaves" className={navLinkStyle}>
                                Manage Leaves
                            </NavLink>
                            <NavLink to="/manage-employees" className={navLinkStyle}>
                                Manage Employees
                            </NavLink>
                        </div>
                    )}

                    {/* Admin Controls */}
                    {isAdmin && (
                        <div className="space-y-2">
                            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Administration
                            </p>
                            <NavLink to="/manage-departments" className={navLinkStyle}>
                                Manage Departments
                            </NavLink>
                            <NavLink to="/manage-employees" className={navLinkStyle}>
                                Manage Employees
                            </NavLink>
                        </div>
                    )}
                </nav>

                <div className="p-4 border-t">
                    <button
                        onClick={logout}
                        className="w-full px-4 py-2 text-sm text-white bg-gray-800 rounded-md hover:bg-gray-900 transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-8">
                <Outlet />
            </main>
        </div>
    );
}