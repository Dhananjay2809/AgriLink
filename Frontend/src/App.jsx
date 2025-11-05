import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./authContext/AuthContext";
import LoginForm from "./pages/LoginForm";
import SignupForm from "./pages/SignupForm";
import Home from "./pages/Feed";
import Profile from "./pages/Profile";
import CreatePost from "./pages/CreatePost";
import Followers from "./pages/Followers";
import Network from "./pages/Network"; // ADD THIS IMPORT
import Navbar from "./components/Navbar";
import LoadingSpinner from "./components/LoadingSpinner";
import PostCard from "./components/PostCard";
import MyPosts from "./components/MyPosts";

// SIMPLE Home component for testing
const SimpleHome = () => {
  const { user, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            🎉 Welcome to AgriLink!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You are successfully logged in as <strong>{user?.firstname}</strong>
          </p>
          <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
            <p className="text-green-800 dark:text-green-200">
              ✅ Authentication is working! User ID: {user?.id}
            </p>
          </div>
          <div className="mt-6 flex space-x-4">
            <button
              onClick={() => window.location.href = '/profile'}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Go to Profile
            </button>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  console.log("🛡️ ProtectedRoute - User:", user, "Loading:", loading);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    console.log("❌ No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  console.log("✅ User authenticated:", user.firstname);
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  console.log("🌐 PublicRoute - User:", user, "Loading:", loading);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (user) {
    console.log("✅ User already logged in, redirecting to home");
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function AppContent() {
  const { user } = useAuth();
  console.log("🎬 AppContent - Current user:", user);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <LoginForm />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <SignupForm />
          </PublicRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <SimpleHome />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Navbar />
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/create-post" element={
          <ProtectedRoute>
            <Navbar />
            <CreatePost />
          </ProtectedRoute>
        } />
        <Route path="/my-posts" element={
          <ProtectedRoute>
            <MyPosts />
        </ProtectedRoute>} />
        <Route path="/followers" element={
          <ProtectedRoute>
            <Navbar />
            <Followers />
          </ProtectedRoute>
        } />
        {/* ADD NETWORK ROUTE INSIDE ROUTES */}
        <Route path="/network" element={
          <ProtectedRoute>
            <Navbar />
            <Network />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;