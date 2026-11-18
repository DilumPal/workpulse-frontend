import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import EmployeeLayout from './components/EmployeeLayout';
import Dashboard from './components/Dashboard';
import StaffDirectory from './components/StaffDirectory';
import LeaveRequest from './components/LeaveRequest';
import Profile from './components/Profile';
import ManageLeaves from './components/ManageLeaves';
import ManageDepartments from './components/ManageDepartments';
import ManageEmployees from './components/ManageEmployees';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Secured Routes with Sidebar Layout */}
        <Route 
          element={
            <ProtectedRoute>
              <EmployeeLayout />
            </ProtectedRoute>
          }
        >
          {/* These pages render inside the <Outlet /> of EmployeeLayout */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/directory" element={<StaffDirectory />} />
          <Route path="/leave-request" element={<LeaveRequest />} />
          <Route path="/profile" element={<Profile />} /> {/* Added Profile Route */}
          <Route path="/manage-leaves" element={<ManageLeaves />} />
          <Route path="/manage-departments" element={<ManageDepartments />} />
          <Route path="/manage-employees" element={<ManageEmployees />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;