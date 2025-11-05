import { useState, useEffect } from "react";
import { searchUsers } from "../api/search";
import { sendFollowRequest } from "../api/requests";
import { useAuth } from "../authContext/AuthContext";

const SearchModal = ({ isOpen, onClose }) => {
  const { user: currentUser } = useAuth();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sendingRequests, setSendingRequests] = useState({});

  useEffect(() => {
    if (query.trim().length > 2) {
      searchUsersDebounced(query);
    } else {
      setUsers([]);
    }
  }, [query]);

  const searchUsersDebounced = (searchQuery) => {
    setLoading(true);
    setError("");
    
    setTimeout(async () => {
      try {
        const response = await searchUsers(searchQuery);
        setUsers(response.data.users || []);
      } catch (err) {
        console.error("Search error:", err);
        setError("Failed to search users");
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleFollow = async (userId) => {
    try {
      setSendingRequests(prev => ({ ...prev, [userId]: true }));
      setError("");
      
      console.log("🔄 Sending follow request to user ID:", userId);
      const response = await sendFollowRequest(userId);
      console.log("✅ Follow request sent:", response.data);
      
      // Update UI to show request sent
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId 
            ? { ...user, followStatus: 'request_sent' }
            : user
        )
      );
      
      // 🔥 IMPORTANT: Trigger refresh for Network page
      console.log("🔄 Dispatching refresh event for Network page");
      window.dispatchEvent(new CustomEvent('refreshNetworkData'));
      
    } catch (err) {
      console.error("💥 Follow error:", err);
      console.error("💥 Error response:", err.response?.data);
      setError(err.response?.data?.message || "Failed to send follow request");
    } finally {
      setSendingRequests(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleClose = () => {
    setQuery("");
    setUsers([]);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-20">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Search Users
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              autoFocus
            />
            <svg className="w-5 h-5 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-96">
          {error && (
            <div className="p-4 text-sm text-red-800 bg-red-50 dark:bg-red-900 dark:text-red-200">
              {error}
              <button 
                onClick={() => setError("")}
                className="ml-2 text-red-600 hover:text-red-800 font-bold"
              >
                ×
              </button>
            </div>
          )}

          {loading && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Searching...</span>
              </div>
            </div>
          )}

          {!loading && users.length === 0 && query.trim().length > 2 && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No users found
            </div>
          )}

          {!loading && query.trim().length <= 2 && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Type at least 3 characters to search
            </div>
          )}

          {users.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-300">
                    {user.firstname?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user.firstname} {user.lastname || ''}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                    {user.role}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleFollow(user._id)}
                disabled={
                  sendingRequests[user._id] || 
                  user.followStatus === 'request_sent' ||
                  user._id === currentUser?.id
                }
                className={`px-3 py-1 rounded text-sm font-medium ${
                  user._id === currentUser?.id
                    ? 'bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400 cursor-not-allowed'
                    : user.followStatus === 'request_sent'
                    ? 'bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                }`}
              >
                {user._id === currentUser?.id
                  ? 'You'
                  : sendingRequests[user._id] 
                  ? 'Sending...' 
                  : user.followStatus === 'request_sent' 
                  ? 'Request Sent' 
                  : 'Follow'
                }
              </button>
            </div>
          ))}
        </div>

        {/* Footer with Info */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Found {users.length} user{users.length !== 1 ? 's' : ''}
            {query.trim().length > 2 && !loading && ` for "${query}"`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;