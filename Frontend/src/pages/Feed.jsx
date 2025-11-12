import { useState, useEffect } from "react";
import { getFeed } from "../api/posts";
import { useAuth } from "../authContext/AuthContext";
import PostCard from "../components/PostCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Try to get user's location first, then fetch feed
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by this browser.");
      fetchFeed(); // Fetch feed without location
      return;
    }

    setLocationLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        fetchFeed(latitude, longitude);
        setLocationLoading(false);
      },
      (error) => {
        console.log("Error getting location:", error);
        fetchFeed(); // Fetch feed without location
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000 // 10 minutes
      }
    );
  };

  const fetchFeed = async (latitude = null, longitude = null) => {
    try {
      setLoading(true);
      const response = await getFeed(latitude, longitude);
      setPosts(response.data.posts || []);
    } catch (err) {
      setError("Failed to load feed");
      console.error("Feed error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostDelete = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  const refreshFeedWithLocation = () => {
    getUserLocation();
  };

  if (loading || locationLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
       <Navbar />
      <div className="max-w-4xl mx-auto px-4">
        {/* Welcome Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.firstname || user?.name}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {userLocation 
                  ? "Showing posts from users you follow and nearby locations." 
                  : "Showing posts from users you follow. Enable location to see nearby posts."}
              </p>
            </div>
            <div className="flex gap-3">
              {!userLocation && (
                <button
                  onClick={refreshFeedWithLocation}
                  className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Enable Location
                </button>
              )}
              <Link 
                to="/create-post"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Post
              </Link>
            </div>
          </div>
        </div>

        {/* Feed Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {userLocation ? "Personalized Feed" : "Following Feed"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {userLocation 
                ? "Posts from followed users and nearby locations" 
                : "Posts from users you follow"}
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-500 dark:text-gray-400 block">
              {posts.length} posts
            </span>
            {userLocation && (
              <button
                onClick={refreshFeedWithLocation}
                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                Refresh location
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 mb-4 text-sm text-red-800 bg-red-50 rounded-lg dark:bg-red-900 dark:text-red-200">
            {error}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
              {userLocation ? "No posts in your area" : "No posts available yet"}
            </div>
            <p className="text-gray-400 dark:text-gray-500 mb-6">
              {userLocation 
                ? "Try creating a post or following more users to see content in your feed."
                : "Be the first to create a post and connect with the community!"}
            </p>
            <div className="flex gap-4 justify-center">
              {!userLocation && (
                <button
                  onClick={refreshFeedWithLocation}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Enable Location Feed
                </button>
              )}
              <Link 
                to="/create-post"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Post
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard 
                key={post._id} 
                post={post} 
                onDelete={handlePostDelete}
                showActions={true}
                showDistance={userLocation && post.location}
                userLocation={userLocation}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;