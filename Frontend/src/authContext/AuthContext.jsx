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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      console.log("🔍 Checking auth - storedUser:", storedUser);
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        
        // Verify the token is still valid by making an API call
        try {
          console.log("🔐 Verifying token validity...");
          const profileResponse = await getProfile();
          console.log("✅ Token is valid, user:", profileResponse.data.user);
          
          // Use the fresh user data from the API
          setUser(profileResponse.data.user);
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(profileResponse.data.user));
          
        } catch (error) {
          console.log("❌ Token invalid or expired:", error.response?.status);
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        console.log("❌ No user found in localStorage");
        setUser(null);
      }
    } catch (error) {
      console.error('💥 Auth check failed:', error);
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    console.log("🔐 Login function called with:", userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    console.log("💾 User saved to localStorage");
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      console.log("🚪 Logging out user");
      setUser(null);
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  const refreshUser = async () => {
    try {
      const profileResponse = await getProfile();
      setUser(profileResponse.data.user);
      localStorage.setItem('user', JSON.stringify(profileResponse.data.user));
    } catch (error) {
      console.error('Failed to refresh user:', error);
      logout();
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    refreshUser
  };

  console.log("🔄 AuthProvider rendering - user:", user, "loading:", loading);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};