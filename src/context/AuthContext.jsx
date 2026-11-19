import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

const extractRole = (decoded, responseRole) => {
  if (responseRole) return responseRole;
  if (decoded?.role) return decoded.role;
  if (Array.isArray(decoded?.roles) && decoded.roles.length > 0)
    return decoded.roles[0];
  if (Array.isArray(decoded?.authorities) && decoded.authorities.length > 0) {
    const auth = decoded.authorities[0];
    return typeof auth === "string" ? auth : auth.authority;
  }
  return "";
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const role = extractRole(decoded, savedRole);
        setUser({ email: decoded.sub, role });
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const token = response.data.token;
    const decoded = jwtDecode(token);
    const role = extractRole(decoded, response.data.role);

    localStorage.setItem("token", token);
    if (role) localStorage.setItem("role", role);

    setUser({ email: decoded.sub, role });

    if (role.toUpperCase().includes("ADMIN")) {
      navigate("/manage-departments");
    } else if (role.toUpperCase().includes("HR")) {
      navigate("/hr-dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
    navigate("/login");
  };

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
