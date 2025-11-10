import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./authContext/AuthContext";
import LoginForm from "./pages/LoginForm";
import SignupForm from "./pages/SignupForm";
import Home from "./components/Home";
import Profile from "./pages/Profile";
import CreatePost from "./pages/CreatePost";
import Followers from "./pages/Followers";
import Network from "./pages/Network";
import LoadingSpinner from "./components/LoadingSpinner";
import MyPosts from "./components/MyPosts";

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
      {/* NAVBAR REMOVED FROM HERE */}
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
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/create-post" element={
          <ProtectedRoute>
            <CreatePost />
          </ProtectedRoute>
        } />
        <Route path="/my-posts" element={
          <ProtectedRoute>
            <MyPosts />
          </ProtectedRoute>
        } />
        <Route path="/followers" element={
          <ProtectedRoute>
            <Followers />
          </ProtectedRoute>
        } />
        <Route path="/network" element={
          <ProtectedRoute>
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