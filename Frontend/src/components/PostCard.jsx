import { useState, useEffect } from "react";
import { deletePost } from "../api/posts";
import { useAuth } from "../authContext/AuthContext";
import { calculateDistance } from "../utils/locationUtils";

const PostCard = ({ post, onDelete, showActions = false, showDistance = false, userLocation = null }) => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [distance, setDistance] = useState(null);

  // Calculate distance when component mounts or props change
  useEffect(() => {
    if (showDistance && userLocation && post.coordinates) {
      const calculatedDistance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        post.coordinates.latitude,
        post.coordinates.longitude
      );
      setDistance(calculatedDistance);
    } else {
      setDistance(null);
    }
  }, [showDistance, userLocation, post.coordinates]);

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

  // Get user info from populated userID field
  const userInfo = post.userID;
  const isOwner = user?.id === userInfo?._id;

  // Get display name
  const getDisplayName = () => {
    return userInfo?.name || userInfo?.firstname || 'Unknown User';
  };

  // Get first character for avatar
  const getAvatarChar = () => {
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  // Format price with Indian Rupee symbol
  const formatPrice = (price) => {
    return `₹${parseInt(price).toLocaleString('en-IN')}`;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden group">
      
      {/* Image Section */}
      {post.images && post.images.length > 0 && (
        <div className="relative h-64 overflow-hidden">
          <img
            src={post.images[0]}
            alt={post.cropType}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Status Badge */}
          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
            post.status === 'available' 
              ? 'bg-green-500 text-white'
              : 'bg-gray-500 text-white'
          }`}>
            {post.status?.toUpperCase()}
          </div>

          {/* Crop Type Badge */}
          <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-800 dark:text-white capitalize">
            {post.cropType}
          </div>

          {/* Distance Badge */}
          {distance !== null && (
            <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-xs font-medium text-white">
              {distance.toFixed(1)} km away
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">
                {getAvatarChar()}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                {getDisplayName()}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {userInfo?.role}
              </p>
            </div>
          </div>
          
          {showActions && isOwner && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>{isDeleting ? "Deleting..." : "Delete"}</span>
            </button>
          )}
        </div>

        {/* Price and Quantity */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {post.pricePerUnit ? formatPrice(post.pricePerUnit) : 'N/A'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Price/Kg</p>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {post.quantity || 'N/A'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Quantity (kg)</p>
          </div>
        </div>

        {/* Location */}
        {post.location && (
          <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-gray-700 dark:text-gray-300">{post.location}</span>
          </div>
        )}

        {/* Description */}
        {post.description && (
          <div className="mb-4">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {post.description}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formatDate(post.createdAt)}</span>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button className="flex items-center space-x-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Message</span>
            </button>
            <button className="flex items-center space-x-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>Interested</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;