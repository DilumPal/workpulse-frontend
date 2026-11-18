import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Check if the user is already logged in on page refresh
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Spring Security JWTs usually store the username in the 'sub' (subject) claim
                setUser({ email: decoded.sub, role: decoded.role || 'ROLE_EMPLOYEE' }); 
            } catch (err) {
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        // Adjust response.data.token based on the exact variable name in your Spring Boot AuthResponse object
        const response = await api.post('/auth/login', { email, password });
        const token = response.data.token; 
        
        localStorage.setItem('token', token);
        const decoded = jwtDecode(token);
        setUser({ email: decoded.sub, role: decoded.role || 'ROLE_EMPLOYEE' });
        navigate('/dashboard');
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    if (loading) return <div className="p-10">Loading...</div>;

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};