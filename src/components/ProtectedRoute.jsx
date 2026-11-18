import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
    const { user } = useContext(AuthContext);

    if (!user) {
        // Not logged in, send to login page
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        // Logged in, but trying to access an Admin page as a standard employee
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}