import { useState, useEffect } from "react";
import { getMyPosts } from "../api/posts";
import { useAuth } from "../authContext/AuthContext";
import PostCard from "./PostCard";
import LoadingSpinner from "./LoadingSpinner";
import Navbar from "./Navbar";

const MyPosts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getMyPosts();
      setPosts(response.data.myPosts || []);
    } catch (err) {
      setError("Failed to load your posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyPosts();
    }
  }, [user]);

  const handleDeletePost = (deletedPostId) => {
    setPosts(prev => prev.filter(post => post._id !== deletedPostId));
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
            My Posts
          </h1>
          <button
            onClick={fetchMyPosts}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
          >
            Refresh Posts
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

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
              You haven't created any posts yet
            </div>
            <p className="text-gray-400 dark:text-gray-500">
              Create your first post to get started!
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={handleDeletePost}
                showActions={true}
              />
            ))}
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Showing {posts.length} post{posts.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};

export default MyPosts;