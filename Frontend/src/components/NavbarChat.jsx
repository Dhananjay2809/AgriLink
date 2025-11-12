// components/NavbarChat.jsx
import { useState } from 'react';
import { useAuth } from '../authContext/AuthContext';
import MessagesBox from './MessagesBox';

const NavbarChat = () => {
  const { user } = useAuth();
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      {/* Message Button */}
      <button
        onClick={() => setIsMessagesOpen(true)}
        className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 cursor-pointer"
        aria-label="Messages"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {/* Messages Box */}
      <MessagesBox 
        isOpen={isMessagesOpen} 
        onClose={() => setIsMessagesOpen(false)} 
      />
    </>
  );
};

export default NavbarChat;