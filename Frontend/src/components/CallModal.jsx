import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../authContext/AuthContext';

const CallModal = ({ callInfo, onAccept, onReject, onEndCall, isIncoming = false, localStream, remoteStream }) => {
  const { user: currentUser } = useAuth();
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const intervalRef = useRef(null);

  const { callType, roomId } = callInfo || {};
  const isAudioOnly = callType === 'audio';

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (!isIncoming && callType) {
      // Start call timer for outgoing calls
      intervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isIncoming, callType]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 ${isAudioOnly ? 'max-w-sm' : 'max-w-4xl'}`}>
        {/* Call Header */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {isIncoming ? 'Incoming Call' : 'Calling...'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {callType === 'audio' ? 'Audio Call' : 'Video Call'}
          </p>
          {callDuration > 0 && (
            <p className="text-lg font-mono text-green-600 dark:text-green-400">
              {formatTime(callDuration)}
            </p>
          )}
        </div>

        {/* Video/Audio Area */}
        <div className={`mb-6 ${isAudioOnly ? '' : 'grid grid-cols-2 gap-4'}`}>
          {/* Local Video/Audio */}
          <div className={`${isAudioOnly ? 'text-center' : 'bg-gray-900 rounded-lg'}`}>
            {isAudioOnly ? (
              <div className="flex flex-col items-center justify-center h-32">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-2">
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-300">
                    {currentUser?.firstname?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">You</p>
              </div>
            ) : (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-48 rounded-lg object-cover"
              />
            )}
          </div>

          {/* Remote Video/Audio */}
          <div className={`${isAudioOnly ? 'text-center' : 'bg-gray-900 rounded-lg'}`}>
            {isAudioOnly ? (
              <div className="flex flex-col items-center justify-center h-32">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-2">
                  <span className="text-lg font-bold text-green-600 dark:text-green-300">
                    {callInfo?.callerName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {callInfo?.callerName || 'User'}
                </p>
              </div>
            ) : (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-48 rounded-lg object-cover"
              />
            )}
          </div>
        </div>

        {/* Call Controls */}
        <div className="flex justify-center space-x-6">
          {isIncoming ? (
            <>
              <button
                onClick={onAccept}
                className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 10.999h2C22 5.869 18.127 2 12.99 2v2C17.052 4 20 6.943 20 10.999z"/>
                  <path d="M13 8c2.103 0 3 .897 3 3v2h2c0-2.837-1.663-5.018-5-5.874V8z"/>
                  <path d="M12.5 8C10.015 8 8 10.015 8 12.5s2.015 4.5 4.5 4.5 4.5-2.015 4.5-4.5S14.985 8 12.5 8zM12.5 15C10.565 15 9 13.435 9 11.5S10.565 8 12.5 8s3.5 1.565 3.5 3.5S14.435 15 12.5 15z"/>
                </svg>
              </button>
              <button
                onClick={onReject}
                className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 10.586L16.95 5.636L18.364 7.05L13.414 12L18.364 16.95L16.95 18.364L12 13.414L7.05 18.364L5.636 16.95L10.586 12L5.636 7.05L7.05 5.636L12 10.586Z"/>
                </svg>
              </button>
            </>
          ) : (
            <button
              onClick={onEndCall}
              className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 10.586L16.95 5.636L18.364 7.05L13.414 12L18.364 16.95L16.95 18.364L12 13.414L7.05 18.364L5.636 16.95L10.586 12L5.636 7.05L7.05 5.636L12 10.586Z"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallModal;