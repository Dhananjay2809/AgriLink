import { useState, useRef } from "react";
import { useAuth } from "../authContext/AuthContext";

const ProfileImageUpload = ({ onImageUpdate, currentImage, onClose }) => {
  const { user, updateUserProfile } = useAuth(); // ✅ CHANGED
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      console.log('🔄 Uploading profile image with cookie authentication...');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
        method: 'PUT',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Profile image uploaded:', data);
        
        // Update local storage and parent component
        if (data.user) {
          updateUserProfile(data.user); // ✅ CHANGED
          onImageUpdate?.(data.user);
        }
        
        onClose?.();
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;

    setUploading(true);
    try {
      console.log('🔄 Removing profile image with cookie authentication...');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/remove-image`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Profile image removed:', data);
        
        // Update local storage and parent component
        if (data.user) {
          updateUserProfile(data.user); // ✅ CHANGED
          onImageUpdate?.(data.user);
        }
        
        onClose?.();
      } else {
        throw new Error(data.message || 'Remove failed');
      }
    } catch (error) {
      console.error('❌ Remove error:', error);
      alert(error.message || 'Failed to remove image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Profile Picture
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            disabled={uploading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Current Image Preview */}
          <div className="flex justify-center">
            {currentImage ? (
              <img
                src={currentImage}
                alt="Current Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold text-gray-500 dark:text-gray-400">
                  {user?.firstname?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload New Photo'}
            </button>

            {currentImage && (
              <button
                onClick={handleRemoveImage}
                disabled={uploading}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? 'Removing...' : 'Remove Photo'}
              </button>
            )}

            <button
              onClick={onClose}
              disabled={uploading}
              className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Recommended: Square image, max 5MB (JPEG, PNG, WebP)
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileImageUpload;