import { useState } from "react";
import { useUser } from "../context/UserContext";
import { MdError, MdVisibility, MdVisibilityOff } from "react-icons/md";

function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { signIn } = useUser();

  // Function to get user-friendly error messages
  const getFriendlyErrorMessage = (error) => {
    if (!error) return "";

    const errorMessage = error.message || error.toString();

    if (errorMessage.includes("Invalid login credentials")) {
      return "Invalid email or password. Please check your credentials and try again.";
    }
    if (errorMessage.includes("Email not confirmed")) {
      return "Please check your email and click the confirmation link before signing in.";
    }
    if (errorMessage.includes("Too many requests")) {
      return "Too many login attempts. Please wait a few minutes before trying again.";
    }
    if (errorMessage.includes("Network")) {
      return "Network error. Please check your internet connection and try again.";
    }
    if (errorMessage.includes("Invalid email")) {
      return "Please enter a valid email address.";
    }

    // Default fallback for other errors
    return "Something went wrong. Please try again later.";
  };

  async function handleSignIn(e) {
    e.preventDefault();

    // Reset previous error
    setError("");

    // Basic validation for empty fields
    if (!email.trim() && !password.trim()) {
      setError("Please enter your email and password to sign in.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    const formData = {
      email: email.trim(),
      password: password,
    };

    try {
      await signIn(formData);
    } catch (err) {
      console.error("Sign in error:", err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-100 py-8 px-2">
      <form
        className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md flex flex-col gap-6 border border-slate-200"
        onSubmit={handleSignIn}
      >
        <div className="flex flex-col items-center mb-2">
          <div className="bg-blue-100 rounded-full p-3 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 text-blue-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25v-1.5A2.25 2.25 0 016.75 16.5h10.5a2.25 2.25 0 012.25 2.25v1.5"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-blue-700">Sign In</h2>
          <p className="text-slate-500 text-sm mt-1">
            Welcome back! Please enter your details.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <MdError size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 text-sm font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="font-semibold text-slate-700">
              Email
            </label>
            <input
              id="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              disabled={isLoading}
              className={`border rounded-lg p-3 focus:outline-none focus:ring-2 transition-colors ${
                error &&
                (!email.trim() || error.toLowerCase().includes("email"))
                  ? "border-red-300 focus:ring-red-200 bg-red-50"
                  : "border-slate-300 focus:ring-blue-200 bg-white"
              } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="font-semibold text-slate-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                required
                disabled={isLoading}
                className={`border rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 transition-colors w-full ${
                  error &&
                  (!password.trim() || error.toLowerCase().includes("password"))
                    ? "border-red-300 focus:ring-red-200 bg-red-50"
                    : "border-slate-300 focus:ring-blue-200 bg-white"
                } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
              >
                {showPassword ? (
                  <MdVisibilityOff size={20} />
                ) : (
                  <MdVisibility size={20} />
                )}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`font-bold py-3 rounded-lg shadow-md transition-all mt-2 flex items-center justify-center gap-2 ${
            isLoading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
          } text-white`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Signing In...</span>
            </>
          ) : (
            "Sign In"
          )}
        </button>

        <div className="text-center text-sm text-slate-500 mt-2">
          Don't have an account?{" "}
          <a
            href="/signup"
            className="text-blue-600 hover:underline font-semibold"
          >
            Sign up
          </a>
        </div>
      </form>
    </div>
  );
}

export default Signin;
