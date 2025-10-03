import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import axios from 'axios';

// Import pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VivoRechargePage from './pages/VivoRechargePage';
import TimRechargePage from './pages/TimRechargePage';
import PayBillPage from './pages/PayBillPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Configure axios defaults
axios.defaults.baseURL = API;

// Auth Context
export const AuthContext = React.createContext({
  user: null,
  admin: null,
  login: () => {},
  loginAdmin: () => {},
  logout: () => {},
  isAuthenticated: false,
  isAdmin: false
});

function App() {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const parsedUser = JSON.parse(userData);
      
      if (userType === 'admin') {
        setAdmin(parsedUser);
      } else {
        setUser(parsedUser);
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userType', 'user');
    localStorage.setItem('userData', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    toast.success('Login realizado com sucesso!');
  };

  const loginAdmin = (adminData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userType', 'admin');
    localStorage.setItem('userData', JSON.stringify(adminData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setAdmin(adminData);
    toast.success('Login de administrador realizado com sucesso!');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setAdmin(null);
    toast.success('Logout realizado com sucesso!');
  };

  const isAuthenticated = !!(user || admin);
  const isAdmin = !!admin;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      admin,
      login,
      loginAdmin,
      logout,
      isAuthenticated,
      isAdmin
    }}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to={isAdmin ? "/admin" : "/dashboard"} />} />
            <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />} />
            <Route path="/admin-login" element={!isAdmin ? <AdminLoginPage /> : <Navigate to="/admin" />} />
            
            {/* Protected User Routes */}
            <Route path="/dashboard" element={user ? <UserDashboard /> : <Navigate to="/login" />} />
            <Route path="/vivo-recarga" element={user ? <VivoRechargePage /> : <Navigate to="/login" />} />
            <Route path="/tim-planos" element={user ? <TimRechargePage /> : <Navigate to="/login" />} />
            <Route path="/tim-recarga" element={user ? <TimRechargeSimplePage /> : <Navigate to="/login" />} />
            <Route path="/claro-recarga" element={user ? <ClaroRechargePage /> : <Navigate to="/login" />} />
            <Route path="/pagar-fatura" element={user ? <PayBillPage /> : <Navigate to="/login" />} />
            
            {/* Protected Admin Routes */}
            <Route path="/admin" element={admin ? <AdminDashboard /> : <Navigate to="/admin-login" />} />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <Toaster position="top-right" richColors />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
