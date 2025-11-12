// components/MessagesBox.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../authContext/AuthContext';
import ChatRoom from './chatRoom';
import { getMyFollowing } from '../api/requests';

const MessagesBox = ({ isOpen, onClose }) => {
  const { user: currentUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesBoxRef = useRef(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadFriends();
    }
  }, [isOpen, currentUser]);

  const loadFriends = async () => {
    setLoading(true);
    try {
      const response = await getMyFollowing();
      // Use actual API response
      const followingUsers = response.data.following || response.data || [];
      
      // Add temporary online status (replace with real data from your backend)
      const friendsWithStatus = followingUsers.map(friend => ({
        ...friend,
        online: Math.random() > 0.5 // Temporary - replace with real online status from your API
      }));
      
      setFriends(friendsWithStatus);
    } catch (error) {
      console.error('Error loading friends:', error);
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (messagesBoxRef.current && !messagesBoxRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleFriendClick = (friend) => {
    setSelectedUser(friend);
  };

  if (!isOpen) return null;

  if (selectedUser) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-4xl h-[80vh]">
          <ChatRoom 
            targetUser={selectedUser} 
            onClose={() => {
              setSelectedUser(null);
              onClose();
            }} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div 
        ref={messagesBoxRef}
        className="bg-white dark:bg-gray-800 w-full h-screen flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Friends List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="p-2">
              {friends.length > 0 ? (
                friends.map((friend) => (
                  <div
                    key={friend._id}
                    onClick={() => handleFriendClick(friend)}
                    className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors mb-2"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-300">
                          {friend.firstname?.charAt(0)?.toUpperCase() || friend.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      {friend.online && (
                        <div className="absolute bottom-0 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {friend.firstname || friend.name} {friend.lastname || ''}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {friend.online ? 'Online' : 'Offline'}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No friends found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesBox;