import { useState } from "react";
import { deletePost } from "../api/posts";
import { useAuth } from "../authContext/AuthContext";

const PostCard = ({ post, onDelete, showActions = false }) => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    setIsDeleting(true);
    try {
      await deletePost(post._id);
      onDelete?.(post._id);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwner = user?.id === post.userID?._id;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-blue-600 dark:text-blue-300">
              {post.userID?.name?.charAt(0) || post.userID?.firstname?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {post.userID?.name || post.userID?.firstname}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {post.userID?.role} • {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {showActions && isOwner && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>

      {/* Post Image */}
      {post.images && post.images.length > 0 && (
        <div className="mb-4">
          <img
            src={post.images[0]}
            alt={post.cropType}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Post Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium capitalize">
            {post.cropType}
          </span>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            post.status === 'available' 
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {post.status}
          </span>
        </div>

        {post.quantity && (
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Quantity:</strong> {post.quantity} kg
          </p>
        )}

        {post.pricePerUnit && (
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Price:</strong> ₹{post.pricePerUnit} per kg
          </p>
        )}

        {post.location && (
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Location:</strong> {post.location}
          </p>
        )}

        {post.description && (
          <p className="text-gray-700 dark:text-gray-300">
            {post.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default PostCard;