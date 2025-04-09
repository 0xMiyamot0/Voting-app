import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(JSON.parse(storedUser));
      checkAuthStatus();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/check-auth');
      setIsAuthenticated(true);
      setIsAdmin(response.data.is_admin);
      setHasVoted(response.data.has_voted);
    } catch (error) {
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setIsAdmin(false);
    setHasVoted(false);
    setUser(null);
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/login', {
        username,
        password,
      });
      
      localStorage.setItem('token', 'dummy-token');
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setIsAuthenticated(true);
      setIsAdmin(response.data.user.is_admin);
      setHasVoted(response.data.user.has_voted);
      setUser(response.data.user);
      
      // Redirect to admin panel if user is admin
      if (response.data.user.is_admin) {
        window.location.href = '/admin';
      }
      
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/api/logout', {}, {
        withCredentials: true
      });
      clearAuthData();
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if the server request fails, clear local data
      clearAuthData();
    }
  };

  const value = {
    isAuthenticated,
    isAdmin,
    hasVoted,
    loading,
    user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 