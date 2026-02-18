// contexts/NotificationContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../authContext/AuthContext';
import { getNotifications } from '../api/notifications';
import io from 'socket.io-client';

const NotificationContext = createContext();

export const useNotifications = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const { user: currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeToast, setActiveToast] = useState(null);

  // Load notifications
  const loadNotifications = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const response = await getNotifications();
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show toast notification
  const showToast = (notification) => {
    setActiveToast(notification);
  };

  // Hide toast notification
  const hideToast = () => {
    setActiveToast(null);
  };

  // Socket.io for real-time notifications
  useEffect(() => {
    let socket;

    if (currentUser) {
      socket = io('http://localhost:5000', { withCredentials: true });
      socket.emit('joinUser', currentUser._id);

      socket.on('newNotification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast instead of auto-opening dropdown
        showToast(notification);
      });

      // Load initial notifications
      loadNotifications();
    }

    return () => {
      socket?.disconnect();
    };
  }, [currentUser]);

  const value = {
    notifications,
    unreadCount,
    showNotifications,
    setShowNotifications,
    loading,
    loadNotifications,
    setNotifications,
    setUnreadCount,
    activeToast,
    showToast,
    hideToast
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};