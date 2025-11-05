import { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../api/profile';
import { logoutUser } from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token'); // CHECK FOR TOKEN
      
      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } else if (storedUser && !storedToken) {
        // User data exists but no token - this is the current broken state
        console.warn('User data found but no authentication token');
        // You might want to redirect to login or clear the broken state
        // localStorage.removeItem('user');
        // setUser(null);
      }
    } catch (error) {
      localStorage.removeItem('user');
      localStorage.removeItem('token'); // CLEAR TOKEN TOO
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, token) => { // ADD TOKEN PARAMETER
    setUser(userData);
    // ✅ CRITICAL: Save BOTH user data AND token
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token); // SAVE THE TOKEN
    setLoginSuccess(true);
    // Hide success message after 3 seconds
    setTimeout(() => setLoginSuccess(false), 3000);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      // ✅ Remove both user data AND token
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    loginSuccess,
    setLoginSuccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};