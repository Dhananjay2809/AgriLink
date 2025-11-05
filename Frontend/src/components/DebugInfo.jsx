import { useAuth } from "../authContext/AuthContext";
import { useEffect } from "react";

const DebugInfo = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log("🔍 DebugInfo - Auth state updated:");
    console.log("   Loading:", loading);
    console.log("   User:", user);
    console.log("   localStorage user:", localStorage.getItem('user'));
  }, [user, loading]);

  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 p-4 rounded-lg z-50 max-w-xs">
      <h3 className="font-bold text-sm mb-2">🔍 Auth Debug</h3>
      <div className="text-xs space-y-1">
        <p><strong>Loading:</strong> {loading ? "✅ Yes" : "❌ No"}</p>
        <p><strong>User:</strong> {user ? "✅ Logged in" : "❌ Not logged in"}</p>
        <p><strong>LocalStorage:</strong> {localStorage.getItem('user') ? "✅ Has user" : "❌ No user"}</p>
        {user && (
          <div className="mt-2 p-2 bg-yellow-200 rounded">
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Name:</strong> {user.name || user.firstname}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugInfo;