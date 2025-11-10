// src/pages/Profile.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import EditProfile from "../components/EditProfile";
import ProfileImageUpload from "../components/ProfileImageUpload"; // ADD THIS IMPORT
import { useAuth } from "../authContext/AuthContext";
import ChatRoom from '../components/chatRoom'; // ADD THIS IMPORT

const Profile = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false); // ADD THIS STATE
  const [chatUser, setChatUser] = useState(null); // ADD THIS STATE

  const handleProfileUpdate = (updatedUser) => {
    // Refresh the profile data
    fetchProfile();
    // Update auth context if needed
    if (updatedUser) {
      login(updatedUser);
    }
  };
  // ADD THESE FUNCTIONS
const handleOpenChat = (user) => {
  console.log("Opening chat with:", user.name || user.firstname);
  setChatUser(user);
};

const handleCloseChat = () => {
  setChatUser(null);
};

  // ADD THIS FUNCTION FOR IMAGE UPLOAD
  const handleImageUpdate = (updatedUser) => {
    // Refresh the profile data
    fetchProfile();
    // Update auth context if needed
    if (updatedUser) {
      login(updatedUser);
    }
    // Close the image upload modal
    setShowImageUploadModal(false);
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
    } else {
      setUser(JSON.parse(userData));
      fetchProfile();
    }
  }, [navigate]);

  const fetchProfile = async () => {
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
        setProfile(data);
      } else {
        console.error("Failed to fetch profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // ADD THIS FUNCTION TO HANDLE PROFILE IMAGE CLICK
  const handleProfileImageClick = () => {
    setShowImageUploadModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-500">Failed to load profile</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Profile Header - UPDATED WITH CLICKABLE PROFILE IMAGE */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* CLICKABLE PROFILE IMAGE - REPLACED STATIC DIV */}
              <div className="relative">
                <div 
                  onClick={handleProfileImageClick}
                  className="cursor-pointer transition-transform hover:scale-105"
                >
                  {profile.user.profilePicture ? (
                    <img
                      src={profile.user.profilePicture}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
                      <span className="text-2xl font-bold text-green-600 dark:text-green-300">
                        {profile.user.firstname?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* EDIT ICON OVERLAY */}
                <div 
                  onClick={handleProfileImageClick}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {profile.user.firstname} {profile.user.lastname || ""}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">{profile.user.email}</p>
                <p className="text-gray-500 dark:text-gray-400 capitalize mt-1">
                  {profile.user.role}
                </p>
                
                <div className="flex space-x-6 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {profile.followersCount || 0}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {profile.followingCount || 0}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {profile.user.crops?.length || 0}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Crops</div>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowEditModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Tabs - KEEP YOUR EXISTING TABS CODE */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "profile"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Profile Info
              </button>
              <button
                onClick={() => setActiveTab("posts")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "posts"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                My Posts
              </button>
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
            </nav>
          </div>

          {/* Tab Content - KEEP YOUR EXISTING TAB CONTENT */}
          <div className="p-6">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Personal Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          First Name
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {profile.user.firstname}
                        </p>
                      </div>
                      {profile.user.lastname && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Last Name
                          </label>
                          <p className="text-gray-900 dark:text-white">
                            {profile.user.lastname}
                          </p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Email
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {profile.user.email}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Role
                        </label>
                        <p className="text-gray-900 dark:text-white capitalize">
                          {profile.user.role}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Additional Information
                    </h3>
                    <div className="space-y-3">
                      {profile.user.age && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Age
                          </label>
                          <p className="text-gray-900 dark:text-white">
                            {profile.user.age} years
                          </p>
                        </div>
                      )}
                      {profile.user.gender && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Gender
                          </label>
                          <p className="text-gray-900 dark:text-white capitalize">
                            {profile.user.gender}
                          </p>
                        </div>
                      )}
                      {profile.user.phoneNumber && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Phone Number
                          </label>
                          <p className="text-gray-900 dark:text-white">
                            {profile.user.phoneNumber}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {profile.user.crops && profile.user.crops.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Crops
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.user.crops.map((crop, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm"
                        >
                          {crop}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "posts" && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  Posts feature coming soon...
                </p>
              </div>
            )}

            {activeTab === "followers" && (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      Followers ({profile.followers?.length || 0})
    </h3>
    {profile.followers && profile.followers.length > 0 ? (
      <div className="space-y-3">
        {profile.followers.map((follower, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-300">
                  {follower.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {follower.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {follower.email}
                </p>
              </div>
            </div>
            
            {/* 🔥 ADD MESSAGE BUTTON HERE */}
            <button
  onClick={() => handleOpenChat(follower)}
  className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 text-sm flex items-center space-x-1"
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
      <p className="text-gray-500 dark:text-gray-400">No followers yet</p>
    )}
  </div>
)}

           {activeTab === "following" && (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      Following ({profile.following?.length || 0})
    </h3>
    {profile.following && profile.following.length > 0 ? (
      <div className="space-y-3">
        {profile.following.map((following, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-green-600 dark:text-green-300">
                  {following.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {following.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {following.email}
                </p>
              </div>
            </div>
            
            {/* 🔥 ADD MESSAGE BUTTON HERE TOO */}
            <button
  onClick={() => handleOpenChat(following)}
  className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 text-sm flex items-center space-x-1"
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
      <p className="text-gray-500 dark:text-gray-400">Not following anyone yet</p>
    )}
  </div>
)}
          </div>
        </div>

        {/* EDIT PROFILE MODAL */}
        {showEditModal && profile && (
          <EditProfile
            user={profile.user}
            onClose={() => setShowEditModal(false)}
            onUpdate={handleProfileUpdate}
          />
        )}
         {/* CHAT ROOM COMPONENT - ADDED THIS */}
        {chatUser && (
          <ChatRoom 
            targetUser={chatUser} 
            onClose={handleCloseChat} 
          />
        )}

        {/* PROFILE IMAGE UPLOAD MODAL - ADD THIS */}
        {showImageUploadModal && (
          <ProfileImageUpload
            onImageUpdate={handleImageUpdate}
            currentImage={profile.user.profilePicture}
            onClose={() => setShowImageUploadModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Profile;