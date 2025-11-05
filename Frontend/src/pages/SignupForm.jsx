import { useState } from "react";
import { signupUser } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const SignupForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    firstname: "", 
    email: "", 
    password: "", 
    role: "farmer" // Required - must be "farmer" or "trader"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Sending signup data:", form);
      
      const res = await signupUser(form);
      console.log("Signup response:", res);
      
      if (res.data.message === "User registered successfully") {
        navigate("/login");
      } else {
        setError(res.data.message || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error details:", err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || 
                          "Signup failed. Please check your data.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <h5 className="text-xl font-medium text-gray-900 dark:text-white">
            Create your account
          </h5>

          {error && (
            <div className="p-3 text-sm text-red-800 bg-red-50 rounded-lg dark:bg-red-900 dark:text-red-200">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Required Fields Only */}
          <div>
            <label htmlFor="firstname" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              First Name *
            </label>
            <input
              type="text"
              name="firstname"
              id="firstname"
              value={form.firstname}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              placeholder="John"
              required
              minLength="4"
              maxLength="20"
            />
            <p className="text-xs text-gray-500 mt-1">4-20 characters required</p>
          </div>

          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Email *
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={form.email}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              placeholder="name@company.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Password *
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={form.password}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              placeholder="••••••••"
              required
              minLength="6"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters required</p>
          </div>

          <div>
            <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Role *
            </label>
            <select
              name="role"
              id="role"
              value={form.role}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              required
            >
              <option value="farmer">Farmer</option>
              <option value="trader">Trader</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create your account"}
          </button>

          <div className="text-sm font-medium text-gray-500 dark:text-gray-300">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-700 hover:underline dark:text-blue-500">
              Login here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;