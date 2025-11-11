import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ChatRoom from '../components/chatRoom';
import { 
  getPendingRequestsReceived, 
  getPendingRequestsSent, 
  getMyFollowers, 
  getMyFollowing,
  acceptFollowRequest,
  rejectFollowRequest,
  cancelFollowRequest
} from "../api/requests";
import { useAuth } from "../authContext/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const Network = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("received");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Data states
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  
  // Chat state
  const [chatUser, setChatUser] = useState(null);

  // Add event listener for refresh events
  useEffect(() => {
    const handleRefreshEvent = () => {
      fetchData();
    };

    window.addEventListener('refreshNetworkData', handleRefreshEvent);
    
    return () => {
      window.removeEventListener('refreshNetworkData', handleRefreshEvent);
    };
  }, [activeTab]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [navigate, user, activeTab]);
  const fetchProfileData = async () => {
  try {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    const response = await fetch("http://localhost:3000/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      credentials: "include"
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return { followers: [], following: [] };
  } catch (error) {
    console.error("Error fetching profile data:", error);
    return { followers: [], following: [] };
  }
};

  const fetchData = async () => {
  try {
    setLoading(true);
    setError("");
    
    switch (activeTab) {
      case "received":
        const receivedResponse = await getPendingRequestsReceived();
        setReceivedRequests(receivedResponse.data || []);
        break;
        
      case "sent":
        const sentResponse = await getPendingRequestsSent();
        setSentRequests(sentResponse.data || []);
        break;
        
      case "followers":
        // Use the profile API instead of /followers/me
        const profileResponse = await fetchProfileData();
        setFollowers(profileResponse.followers || []);
        break;
        
      case "following":
        // Use the profile API instead of /following/me
        const profileResponse2 = await fetchProfileData();
        setFollowing(profileResponse2.following || []);
        break;
    }
  } catch (err) {
    console.error("Network error:", err);
    setError("Failed to load data");
  } finally {
    setLoading(false);
  }
};

  const handleAcceptRequest = async (requestId) => {
    try {
      await acceptFollowRequest(requestId);
      
      // Remove from received requests
      setReceivedRequests(prev => prev.filter(req => req._id !== requestId));
      
      // Refresh followers list
      if (activeTab === "followers") {
        const followersResponse = await getMyFollowers();
        setFollowers(followersResponse.data || []);
      }
      
    } catch (err) {
      console.error("Accept error:", err);
      setError("Failed to accept request");
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await rejectFollowRequest(requestId);
      
      // Remove from received requests
      setReceivedRequests(prev => prev.filter(req => req._id !== requestId));
      
    } catch (err) {
      console.error("Reject error:", err);
      setError("Failed to reject request");
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await cancelFollowRequest(requestId);
      
      // Remove from sent requests
      setSentRequests(prev => prev.filter(req => req._id !== requestId));
      
    } catch (err) {
      console.error("Cancel error:", err);
      const errorMessage = err.response?.data?.message || "Failed to cancel request";
      setError(errorMessage);
      
      // If it's an authorization error, refresh the data
      if (err.response?.status === 403 || err.response?.status === 400) {
        setTimeout(() => {
          fetchData();
        }, 1000);
      }
    }
  };

  // Add chat functions INSIDE the component
  const handleOpenChat = (user) => {
    console.log("Opening chat with:", user.firstname);
    setChatUser(user);
  };

  const handleCloseChat = () => {
    setChatUser(null);
  };

  const handleManualRefresh = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Network
          </h1>
          <button
            onClick={handleManualRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm cursor-progress"
          >
            Refresh Data
          </button>
        </div>

        {error && (
          <div className="p-4 mb-4 text-sm text-red-800 bg-red-50 rounded-lg dark:bg-red-900 dark:text-red-200">
            {error}
            <button 
              onClick={() => setError("")}
              className="ml-2 text-red-600 hover:text-red-800 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("received")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "received"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 cursor-pointer"
                }`}
              >
                Received Requests
                {receivedRequests.length > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {receivedRequests.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("sent")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "sent"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 cursor-pointer"
                }`}
              >
                Sent Requests
                {sentRequests.length > 0 && (
                  <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    {sentRequests.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("followers")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "followers"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 cursor-pointer"
                }`}
              >
                Followers
              </button>
              <button
                onClick={() => setActiveTab("following")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "following"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 cursor-pointer"
                }`}
              >
                Following
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Received Requests */}
            {activeTab === "received" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Pending Follow Requests ({receivedRequests.length})
                </h3>
                {receivedRequests.length > 0 ? (
                  <div className="space-y-3">
                    {receivedRequests.map((request) => (
                      <div
                        key={request._id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-300">
                              {request.fromUserId?.firstname?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {request.fromUserId?.firstname} {request.fromUserId?.lastname || ''}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {request.fromUserId?.email}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                              {request.fromUserId?.role}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAcceptRequest(request._id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request._id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No pending follow requests
                  </p>
                )}
              </div>
            )}

            {/* Sent Requests */}
            {activeTab === "sent" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Sent Follow Requests ({sentRequests.length})
                </h3>
                {sentRequests.length > 0 ? (
                  <div className="space-y-3">
                    {sentRequests.map((request) => (
                      <div
                        key={request._id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-yellow-600 dark:text-yellow-300">
                              {request.toUserId?.firstname?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {request.toUserId?.firstname} {request.toUserId?.lastname || ''}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {request.toUserId?.email}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                              {request.toUserId?.role}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCancelRequest(request._id)}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
                        >
                          Cancel Request
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No sent follow requests
                  </p>
                )}
              </div>
            )}

            {/* Followers */}
            {activeTab === "followers" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Followers ({followers.length})
                </h3>
                {followers.length > 0 ? (
                  <div className="space-y-3">
                    {followers.map((follower) => (
                      <div
                        key={follower._id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-green-600 dark:text-green-300">
                              {follower.firstname?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {follower.firstname} {follower.lastname || ''}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {follower.email}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                              {follower.role}
                            </p>
                          </div>
                        </div>
                        {/* ADD MESSAGE BUTTON HERE */}
                        <button
                          onClick={() => handleOpenChat(follower)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm flex items-center space-x-2 cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span>Message</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No followers yet
                  </p>
                )}
              </div>
            )}

            {/* Following */}
            {activeTab === "following" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Following ({following.length})
                </h3>
                {following.length > 0 ? (
                  <div className="space-y-3">
                    {following.map((follow) => (
                      <div
                        key={follow._id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-purple-600 dark:text-purple-300">
                              {follow.firstname?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {follow.firstname} {follow.lastname || ''}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {follow.email}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                              {follow.role}
                            </p>
                          </div>
                        </div>
                        {/* ADD MESSAGE BUTTON HERE TOO */}
                        <button
                          onClick={() => handleOpenChat(follow)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm flex items-center space-x-2 cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span>Message</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    Not following anyone yet
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chat Room Component */}
        {chatUser && (
          <ChatRoom 
            targetUser={chatUser} 
            onClose={handleCloseChat} 
          />
        )}
      </div>
    </div>
  );
};

export default Network;