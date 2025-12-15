import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';
import jwtDecode from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const decoded = jwtDecode(token);
          // Check if token is expired
          if (decoded.exp * 1000 > Date.now()) {
            const savedUser = JSON.parse(userData);
            
            // If token has admin info, update user data
            if (decoded.is_staff !== undefined || decoded.is_superuser !== undefined) {
              savedUser.isAdmin = decoded.is_staff || decoded.is_superuser || false;
              localStorage.setItem('user', JSON.stringify(savedUser));
            } else {
              // If token doesn't have admin info, try to fetch from API
              try {
                const userInfoResponse = await authAPI.getCurrentUser();
                if (userInfoResponse.data) {
                  savedUser.isAdmin = userInfoResponse.data.is_staff || userInfoResponse.data.is_superuser || false;
                  localStorage.setItem('user', JSON.stringify(savedUser));
                }
              } catch (apiError) {
                // API endpoint might not exist, keep existing user data
                console.log('Could not fetch user info on mount');
              }
            }
            
            setUser(savedUser);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    
    loadUser();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authAPI.login(username, password);
      const { access, refresh } = response.data;
      
      // Decode token to get user info
      const decoded = jwtDecode(access);
      
      // Try to get admin status from token first
      let isAdmin = false;
      
      // Check if token has admin info (field exists in token)
      if (decoded.hasOwnProperty('is_staff') || decoded.hasOwnProperty('is_superuser')) {
        isAdmin = decoded.is_staff || decoded.is_superuser || false;
      } else {
        // Token doesn't have admin info, fetch from API
        try {
          const userInfoResponse = await authAPI.getCurrentUser();
          if (userInfoResponse.data) {
            isAdmin = userInfoResponse.data.is_staff || userInfoResponse.data.is_superuser || false;
          }
        } catch (apiError) {
          // API endpoint might not exist, that's okay - user will be treated as regular user
          console.log('User info endpoint not available, user will be treated as regular user');
        }
      }
      
      const userData = {
        username: decoded.username || username,
        isAdmin: isAdmin,
        userId: decoded.user_id,
      };

      localStorage.setItem('token', access);
      localStorage.setItem('refresh', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed',
      };
    }
  };

  const register = async (username, password, phone) => {
    try {
      await authAPI.register(username, password, phone);
      // Auto login after registration
      return await login(username, password);
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || 'Registration failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = () => user?.isAdmin || false;


  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAdmin,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

