import { useState, useEffect } from "react";
import { getMyFollowers, getMyFollowing, getPendingRequests } from "../api/requests";
import LoadingSpinner from "../components/LoadingSpinner";

const Followers = () => {
  const [activeTab, setActiveTab] = useState("followers");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === "followers") {
        const response = await getMyFollowers();
        setFollowers(response.data || []);
      } else if (activeTab === "following") {
        const response = await getMyFollowing();
        setFollowing(response.data || []);
      } else if (activeTab === "pending") {
        const response = await getPendingRequests();
        setPendingRequests(response.data || []);
      }
    } catch (err) {
      setError("Failed to load data");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          My Network
        </h1>

        {error && (
          <div className="p-4 mb-4 text-sm text-red-800 bg-red-50 rounded-lg dark:bg-red-900 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("followers")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "followers"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Followers
              </button>
              <button
                onClick={() => setActiveTab("following")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "following"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Following
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "pending"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Pending Requests
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "followers" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Followers ({followers.length})
                </h3>
                {followers.length > 0 ? (
                  <div className="space-y-3">
                    {followers.map((follower, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-300">
                              {follower.name?.charAt(0) || follower.firstname?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {follower.name || follower.firstname}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {follower.email}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {follower.role}
                        </span>
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

            {activeTab === "following" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Following ({following.length})
                </h3>
                {following.length > 0 ? (
                  <div className="space-y-3">
                    {following.map((follow, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-green-600 dark:text-green-300">
                              {follow.name?.charAt(0) || follow.firstname?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {follow.name || follow.firstname}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {follow.email}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {follow.role}
                        </span>
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

            {activeTab === "pending" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Pending Requests ({pendingRequests.length})
                </h3>
                {pendingRequests.length > 0 ? (
                  <div className="space-y-3">
                    {pendingRequests.map((request, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-yellow-600 dark:text-yellow-300">
                              {request.name?.charAt(0) || request.firstname?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {request.name || request.firstname}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {request.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                            Accept
                          </button>
                          <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No pending requests
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Followers;