import { useState, useEffect } from "react";
import { getFeed } from "../api/posts";
import { useAuth } from "../authContext/AuthContext";
import PostCard from "../components/PostCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { Link } from "react-router-dom";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const response = await getFeed();
      console.log("📦 Feed response:", response);
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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Welcome Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.firstname}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Here's what's happening in the agricultural market today.
              </p>
            </div>
            <Link 
              to="/create-post"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Post
            </Link>
          </div>
        </div>

        {/* Feed Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Market Feed
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {posts.length} posts
          </span>
        </div>

        {error && (
          <div className="p-4 mb-4 text-sm text-red-800 bg-red-50 rounded-lg dark:bg-red-900 dark:text-red-200">
            {error}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
              No posts available yet
            </div>
            <p className="text-gray-400 dark:text-gray-500 mb-6">
              Be the first to create a post and connect with the community!
            </p>
            <Link 
              to="/create-post"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Create Your First Post
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard 
                key={post._id} 
                post={post} 
                onDelete={handlePostDelete}
                showActions={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;