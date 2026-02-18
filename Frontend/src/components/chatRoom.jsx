import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../authContext/AuthContext';
import { getMessages, sendMessage } from '../api/chat';
import io from 'socket.io-client';
import CallModal from './CallModal';

const ChatRoom = ({ targetUser, onClose }) => {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);

  // Helper functions
  const getUserId = (user) => user?._id || user?.id;
  const getUserName = (user) => {
    if (!user) return 'Unknown';
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
      cleanupMedia();
    };
  }, [targetUser, currentUser]);

  const initializeSocket = () => {
    if (!currentUserId || !targetUserId) return;

    socketRef.current = io(import.meta.env.VITE_API_URL, {
      withCredentials: true
    });

    // Join user's personal room
    socketRef.current.emit('joinUser', currentUserId);
    socketRef.current.emit('joinChat', {
      userId: currentUserId,
      targetUserId: targetUserId
    });

    // Message handlers
    socketRef.current.on('messageReceived', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Call event handlers
    socketRef.current.on('incomingCall', async (callData) => {
      console.log('📞 Incoming call received:', callData);
      setIncomingCall({
        ...callData,
        callerName: targetUserName
      });
    });

    socketRef.current.on('callAccepted', async (data) => {
      console.log('✅ Call accepted');
      if (data.answer) {
        await handleRemoteAnswer(data.answer);
      }
      // Don't set activeCall here - let handleAcceptCall handle it
    });

    socketRef.current.on('callRejected', () => {
      console.log('❌ Call rejected');
      setIncomingCall(null);
      setActiveCall(null);
      cleanupMedia();
      alert('Call was rejected');
    });

    socketRef.current.on('callEnded', () => {
      console.log('📞 Call ended');
      setIncomingCall(null);
      setActiveCall(null);
      cleanupMedia();
    });

    socketRef.current.on('webrtcSignal', async (signal) => {
      if (signal.type === 'offer' && peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socketRef.current.emit('webrtcSignal', {
          roomId: activeCall?.roomId,
          signal: answer
        });
      } else if (signal.type === 'answer' && peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
      } else if (signal.candidate && peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
      }
    });

    socketRef.current.on('connect', () => console.log("✅ Connected to chat server"));
    socketRef.current.on('disconnect', () => console.log("❌ Disconnected from chat server"));
  };

  const createPeerConnection = () => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const pc = new RTCPeerConnection(configuration);

    // Add local stream tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('Remote stream received');
      remoteStreamRef.current = event.streams[0];
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('webrtcSignal', {
          roomId: activeCall?.roomId,
          signal: event.candidate
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        console.log('✅ WebRTC connection established');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        console.log('❌ WebRTC connection failed');
        handleEndCall();
      }
    };

    return pc;
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
      socketRef.current.emit('sendMessage', {
        userId: currentUserId,
        targetUserId: targetUserId,
        firstName: getUserName(currentUser),
        text: newMessage
      });

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

  // Call functions
  const initiateCall = async (callType) => {
    if (!currentUserId || !targetUserId) return;

    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video',
        audio: true
      });
      
      localStreamRef.current = stream;

      // Create peer connection
      peerConnectionRef.current = createPeerConnection();

      // Create offer
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      // Set active call
      const roomId = `call_${currentUserId}_${targetUserId}`;
      setActiveCall({
        fromUserId: currentUserId,
        toUserId: targetUserId,
        callType: callType,
        roomId: roomId
      });

      // Send call initiation
      socketRef.current.emit('initiateCall', {
        fromUserId: currentUserId,
        toUserId: targetUserId,
        callType: callType,
        offer: offer,
        roomId: roomId
      });

    } catch (error) {
      console.error('Error initiating call:', error);
      alert('Failed to start call. Please check your camera/microphone permissions.');
      cleanupMedia();
    }
  };

  const handleAcceptCall = async () => {
    if (!incomingCall) return;

    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: incomingCall.callType === 'video',
        audio: true
      });
      
      localStreamRef.current = stream;

      // Create peer connection
      peerConnectionRef.current = createPeerConnection();

      // Set remote description from offer
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(incomingCall.offer)
      );

      // Create answer
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      // ✅ FIX: Convert incoming call to active call
      setActiveCall({
        fromUserId: incomingCall.fromUserId,
        toUserId: incomingCall.toUserId,
        callType: incomingCall.callType,
        roomId: incomingCall.roomId
      });
      setIncomingCall(null);

      // Send acceptance with answer
      socketRef.current.emit('acceptCall', {
        roomId: incomingCall.roomId,
        answer: answer
      });

    } catch (error) {
      console.error('Error accepting call:', error);
      handleRejectCall();
    }
  };

  const handleRemoteAnswer = async (answer) => {
    if (peerConnectionRef.current) {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    }
  };

  const handleRejectCall = () => {
    if (incomingCall) {
      socketRef.current.emit('rejectCall', { roomId: incomingCall.roomId });
      setIncomingCall(null);
      cleanupMedia();
    }
  };

  const handleEndCall = () => {
    if (activeCall) {
      socketRef.current.emit('endCall', { roomId: activeCall.roomId });
    }
    setActiveCall(null);
    setIncomingCall(null);
    cleanupMedia();
  };

  const cleanupMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    remoteStreamRef.current = null;
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
             {targetUser.profilePicture ? (
  <img 
    src={targetUser.profilePicture} 
    alt={targetUserName}
    className="w-12 h-12 rounded-full object-cover"
  />
) : (
  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
    <span className="text-lg font-bold text-blue-600 dark:text-blue-300">
      {targetUserName?.charAt(0)?.toUpperCase() || 'U'}
    </span>
  </div>
)}
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

          {/* Call Buttons - Moved to top right corner */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => initiateCall('audio')}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 flex items-center justify-center group"
              title="Audio Call"
              disabled={!!activeCall || !!incomingCall}
            >
              <svg className="w-6 h-6 group-hover:animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 10.999h2C22 5.869 18.127 2 12.99 2v2C17.052 4 20 6.943 20 10.999z"/>
                <path d="M13 8c2.103 0 3 .897 3 3v2h2c0-2.837-1.663-5.018-5-5.874V8z"/>
                <path d="M12.5 8C10.015 8 8 10.015 8 12.5s2.015 4.5 4.5 4.5 4.5-2.015 4.5-4.5S14.985 8 12.5 8zM12.5 15C10.565 15 9 13.435 9 11.5S10.565 8 12.5 8s3.5 1.565 3.5 3.5S14.435 15 12.5 15z"/>
              </svg>
            </button>
            
            <button
              onClick={() => initiateCall('video')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 flex items-center justify-center group"
              title="Video Call"
              disabled={!!activeCall || !!incomingCall}
            >
              <svg className="w-6 h-6 group-hover:animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 10.5V7C17 6.45 16.55 6 16 6H4C3.45 6 3 6.45 3 7V17C3 17.55 3.45 18 4 18H16C16.55 18 17 17.55 17 17V13.5L21 17.5V6.5L17 10.5Z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area - Now visible during calls */}
      <div className={`flex-1 overflow-y-auto p-6 transition-all duration-300 ${
        activeCall || incomingCall 
          ? 'bg-gray-100 dark:bg-gray-800 opacity-70 blur-sm' 
          : 'bg-gray-50 dark:bg-gray-800'
      }`}>
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
      <div className={`bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 ${
        activeCall || incomingCall ? 'opacity-50' : ''
      }`}>
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message ${targetUserName}...`}
              className="flex-1 p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-lg"
              autoFocus
              disabled={!!activeCall || !!incomingCall}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !!activeCall || !!incomingCall}
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 text-lg font-medium cursor-pointer"
            >
              <span>Send</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* ✅ FIXED: Only show ONE CallModal at a time */}
      {incomingCall && (
        <CallModal
          callInfo={incomingCall}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
          onEndCall={handleEndCall}
          isIncoming={true}
          localStream={localStreamRef.current}
          remoteStream={remoteStreamRef.current}
        />
      )}
      
      {activeCall && !incomingCall && (
        <CallModal
          callInfo={activeCall}
          onEndCall={handleEndCall}
          isIncoming={false}
          localStream={localStreamRef.current}
          remoteStream={remoteStreamRef.current}
        />
      )}
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