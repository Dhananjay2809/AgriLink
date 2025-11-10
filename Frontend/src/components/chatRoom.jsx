import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../authContext/AuthContext';
import { getMessages, sendMessage } from '../api/chat';
import io from 'socket.io-client';

const ChatRoom = ({ targetUser, onClose }) => {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Helper functions
  const getUserId = (user) => user?._id || user?.id;
  const getUserName = (user) => {
    if (!user) return 'Unknown';
    // Extract name from email if no name fields exist
    if (user.email && !user.firstname && !user.name) {
      const emailName = user.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return user.firstname || user.name || user.username || 'Unknown';
  };

  const currentUserId = getUserId(currentUser);
  const targetUserId = getUserId(targetUser);
  const targetUserName = getUserName(targetUser);

  // Initialize chat
  useEffect(() => {
    if (targetUserId && currentUserId) {
      loadMessages();
      initializeSocket();
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [targetUser, currentUser]);

  const initializeSocket = () => {
    if (!currentUserId || !targetUserId) return;

    socketRef.current = io('http://localhost:3000', {
      withCredentials: true
    });

    socketRef.current.emit('joinChat', {
      userId: currentUserId,
      targetUserId: targetUserId
    });

    socketRef.current.on('messageReceived', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socketRef.current.on('connect', () => console.log("✅ Connected to chat server"));
    socketRef.current.on('disconnect', () => console.log("❌ Disconnected from chat server"));
  };

  const loadMessages = async () => {
    if (!currentUserId || !targetUserId) return;

    try {
      setLoading(true);
      const response = await getMessages(currentUserId, targetUserId);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId || !targetUserId) return;

    try {
      // Send via Socket.io for real-time
      socketRef.current.emit('sendMessage', {
        userId: currentUserId,
        targetUserId: targetUserId,
        firstName: getUserName(currentUser),
        text: newMessage
      });

      // Save to database
      await sendMessage({
        userId: currentUserId,
        targetUserId: targetUserId,
        text: newMessage
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!targetUser || !currentUserId) return null;

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-blue-600 dark:text-blue-300">
                  {targetUserName?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {targetUserName} {targetUser.lastname || ''}
                </h2>
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Online
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800 p-6">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No messages yet</h3>
              <p className="text-gray-500 dark:text-gray-400">Start a conversation with {targetUserName}</p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message, index) => (
              <MessageBubble
                key={message._id || index}
                message={message}
                isOwn={message.senderId === currentUserId}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message ${targetUserName}...`}
              className="flex-1 p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-lg"
              autoFocus
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 text-lg font-medium"
            >
              <span>Send</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Separate component for message bubbles
const MessageBubble = ({ message, isOwn }) => (
  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`max-w-xl px-6 py-3 rounded-2xl ${
        isOwn
          ? 'bg-blue-600 text-white rounded-br-none'
          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none shadow-sm'
      }`}
    >
      <p className="text-base">{message.text}</p>
      <p className={`text-xs mt-2 ${
        isOwn ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'
      }`}>
        {new Date(message.createdAt || Date.now()).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </p>
    </div>
  </div>
);

export default ChatRoom;