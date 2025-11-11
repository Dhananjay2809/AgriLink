import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../authContext/AuthContext";
import { changePassword, deleteAccount } from "../api/profile"; // Import your API functions

const Settings = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState("password");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Password change state
  const [passwordData, setPasswordData] = useState({
    password: "", // Changed from currentPassword to match your backend
    newPassword: "",
    confirmPassword: ""
  });

  // Delete account state
  const [confirmDelete, setConfirmDelete] = useState("");

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await changePassword(passwordData);
      
      if (response.status === 200) {
        setMessage("Password changed successfully!");
        setPasswordData({
          password: "",
          newPassword: "",
          confirmPassword: ""
        });
      }
    } catch (err) {
      // Handle error response from API
      if (err.response && err.response.data) {
        setError(err.response.data.message || err.response.data.error || "Failed to change password");
      } else {
        setError("Error changing password");
      }
      console.error("Password change error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmDelete !== "DELETE") {
      setError("Please type DELETE to confirm account deletion");
      return;
    }

    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await deleteAccount();
      
      if (response.status === 200) {
        await logout();
        navigate("/login");
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || err.response.data.error || "Failed to delete account");
      } else {
        setError("Error deleting account");
      }
      console.error("Delete account error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Account Settings
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {/* Sidebar Navigation */}
          <div className="flex flex-col md:flex-row">
            <div className="md:w-64 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
              <nav className="p-4 space-y-2">
                <button
                  onClick={() => setActiveSection("password")}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium ${
                    activeSection === "password"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 cursor-pointer"
                  }`}
                >
                  Change Password
                </button>
                <button
                  onClick={() => setActiveSection("delete")}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium ${
                    activeSection === "delete"
                      ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 cursor-pointer"
                  }`}
                >
                  Delete Account
                </button>
              </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6">
              {message && (
                <div className="p-4 mb-4 text-sm text-green-800 bg-green-50 rounded-lg dark:bg-green-900 dark:text-green-200">
                  {message}
                </div>
              )}

              {error && (
                <div className="p-4 mb-4 text-sm text-red-800 bg-red-50 rounded-lg dark:bg-red-900 dark:text-red-200">
                  {error}
                </div>
              )}

              {/* Change Password Section */}
              {activeSection === "password" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Change Password
                  </h2>
                  
                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.password}
                        onChange={(e) => setPasswordData({
                          ...passwordData,
                          password: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Password must be at least 8 characters with uppercase, lowercase, number and symbol
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Changing Password..." : "Change Password"}
                    </button>
                  </form>
                </div>
              )}

              {/* Delete Account Section */}
              {activeSection === "delete" && (
                <div>
                  <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-6">
                    Delete Account
                  </h2>
                  
                  <div className="max-w-md space-y-4">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-400">
                        <strong>Warning:</strong> This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Type "DELETE" to confirm
                      </label>
                      <input
                        type="text"
                        value={confirmDelete}
                        onChange={(e) => setConfirmDelete(e.target.value)}
                        placeholder="DELETE"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading || confirmDelete !== "DELETE"}
                      className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Deleting Account..." : "Permanently Delete Account"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;