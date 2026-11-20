import { useContext, useEffect, useState } from "react";
import { NavLink, Link, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

export default function EmployeeLayout() {
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);

  const userRole = (user?.role || profile?.role || "").toUpperCase();
  const isAdmin = userRole.includes("ADMIN");
  const isHr = userRole.includes("HR");

  useEffect(() => {
    // Admins do not have an employee profile page, so skip fetching /employees/me
    if (isAdmin) return;

    const fetchMyProfile = async () => {
      try {
        const response = await api.get("/employees/me");
        setProfile(response.data);
      } catch (err) {
        console.error("Failed to load profile data", err);
      }
    };
    fetchMyProfile();
  }, [isAdmin]);

  // Listen for profile updates from Profile.jsx to sync the sidebar immediately
  useEffect(() => {
    const handleProfileUpdate = (e) => {
      if (e.detail) {
        setProfile(e.detail);
      }
    };
    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () =>
      window.removeEventListener("profileUpdated", handleProfileUpdate);
  }, []);

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : user?.email?.split("@")[0];

  const navLinkStyle = ({ isActive }) =>
    `block px-4 py-2 text-sm rounded-lg font-medium transition-all duration-150 ${
      isActive
        ? "bg-blue-600 text-white shadow-md shadow-blue-950/40"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/70 to-sky-100/60 overflow-hidden">
      {/* Left Sidebar - Deep Navy (Non-scrollable) */}
      <aside className="w-64 h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white border-r border-slate-800 shadow-xl flex flex-col overflow-hidden">
        <div className="p-5 border-b border-white/10 flex flex-col items-center shrink-0">
          <h1 className="text-2xl font-bold tracking-tight w-full text-left mb-4 text-white">
            Work<span className="text-sky-400">Pulse</span>
          </h1>

          {isAdmin ? (
            <div className="w-full text-left">
              <span className="inline-block px-3 py-1 text-xs font-bold text-red-300 bg-red-500/20 border border-red-500/30 rounded-full uppercase">
                System Admin
              </span>
              <p className="text-sm text-slate-300 mt-2 truncate">
                {user?.email}
              </p>
            </div>
          ) : (
            <>
              <Link to="/profile" className="block relative group rounded-full">
                <div className="w-20 h-20 rounded-full bg-blue-900/60 overflow-hidden border-4 border-blue-400/30 shadow-lg group-hover:border-sky-400 transition-all">
                  {profile?.profilePhotoUrl ? (
                    <img
                      src={profile.profilePhotoUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl text-sky-200 font-bold bg-blue-900/80 capitalize">
                      {displayName?.charAt(0)}
                    </div>
                  )}
                </div>
              </Link>

              <div className="mt-3 text-center">
                <p className="font-bold text-white capitalize">
                  {displayName}
                </p>
                <p className="text-xs text-blue-200/80 font-medium mt-0.5">
                  {profile?.jobRole || (isHr ? "HR Manager" : "Employee")}
                </p>
              </div>
            </>
          )}
        </div>

        <nav className="flex-1 px-4 py-3 space-y-1 overflow-hidden">
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
            <div className="pt-3 mt-3 border-t border-white/10 space-y-1">
              <p className="px-4 text-xs font-semibold text-blue-300/60 uppercase tracking-wider mb-1.5">
                HR Management
              </p>
              <NavLink to="/hr-dashboard" className={navLinkStyle}>
                HR Dashboard
              </NavLink>
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
            <div className="space-y-1">
              <p className="px-4 text-xs font-semibold text-blue-300/60 uppercase tracking-wider mb-1.5">
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

        <div className="p-4 border-t border-white/10 shrink-0">
          <button
            onClick={logout}
            className="w-full px-4 py-2 text-sm font-medium text-slate-200 bg-white/10 border border-white/10 rounded-lg hover:bg-red-600 hover:border-red-600 hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area - Ice-Blue Workspace */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet context={{ profile }} />
      </main>
    </div>
  );
}