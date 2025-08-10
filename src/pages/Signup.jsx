import { useState } from "react";
import { useUser } from "../context/UserContext";
import {
  MdError,
  MdVisibility,
  MdVisibilityOff,
  MdCheckCircle,
} from "react-icons/md";

function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { signUp } = useUser();

  // Function to get user-friendly error messages
  const getFriendlyErrorMessage = (error) => {
    if (!error) return "";

    const errorMessage = error.message || error.toString();

    if (errorMessage.includes("User already registered")) {
      return "An account with this email already exists. Please sign in instead.";
    }
    if (errorMessage.includes("Password should be at least")) {
      return "Password must be at least 6 characters long.";
    }
    if (errorMessage.includes("Invalid email")) {
      return "Please enter a valid email address.";
    }
    if (errorMessage.includes("Signup is disabled")) {
      return "Account creation is currently disabled. Please contact support.";
    }
    if (errorMessage.includes("Network")) {
      return "Network error. Please check your internet connection and try again.";
    }

    // Default fallback for other errors
    return "Something went wrong. Please try again later.";
  };

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (password.length < 6)
      return { strength: "weak", message: "Too short (minimum 6 characters)" };
    if (password.length < 8)
      return { strength: "fair", message: "Fair strength" };
    if (
      password.length >= 8 &&
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
    ) {
      return { strength: "strong", message: "Strong password" };
    }
    return { strength: "good", message: "Good strength" };
  };

  async function handleSignup(e) {
    e.preventDefault();

    // Reset previous error
    setError("");

    // Check if all fields are empty
    if (!fullName.trim() && !email.trim() && !password.trim()) {
      setError("Please fill in all fields to create your account.");
      return;
    }

    // Individual field validation
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (fullName.trim().split(" ").length < 2) {
      setError("Please enter both your first name and last name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    const [firstName, ...lastNameParts] = fullName.trim().split(" ");
    const lastName = lastNameParts.join(" ");

    const formData = {
      email: email.trim(),
      password: password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    };

    try {
      await signUp(formData);
    } catch (err) {
      console.error("Sign up error:", err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-100 py-8 px-2">
      <form
        onSubmit={handleSignup}
        className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md flex flex-col gap-6 border border-slate-200"
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
                d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-blue-700">Sign Up</h2>
          <p className="text-slate-500 text-sm mt-1">
            Create your account to get started.
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
            <label htmlFor="fullName" className="font-semibold text-slate-700">
              Full Name
            </label>
            <input
              id="fullName"
              placeholder="Enter your first and last name"
              value={fullName}
              type="text"
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={isLoading}
              className={`border rounded-lg p-3 focus:outline-none focus:ring-2 transition-colors ${
                error &&
                (!fullName.trim() || error.toLowerCase().includes("name"))
                  ? "border-red-300 focus:ring-red-200 bg-red-50"
                  : "border-slate-300 focus:ring-blue-200 bg-white"
              } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="font-semibold text-slate-700">
              Email
            </label>
            <input
              id="email"
              placeholder="Enter your email address"
              value={email}
              type="email"
              onChange={(e) => setEmail(e.target.value)}
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
                placeholder="Create a secure password"
                value={password}
                type={showPassword ? "text" : "password"}
                onChange={(e) => setPassword(e.target.value)}
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

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2">
                {(() => {
                  const { strength, message } = getPasswordStrength(password);
                  const strengthColors = {
                    weak: "text-red-600 bg-red-100",
                    fair: "text-orange-600 bg-orange-100",
                    good: "text-blue-600 bg-blue-100",
                    strong: "text-green-600 bg-green-100",
                  };
                  return (
                    <div
                      className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${strengthColors[strength]}`}
                    >
                      {strength === "strong" && <MdCheckCircle size={14} />}
                      <span>{message}</span>
                    </div>
                  );
                })()}
              </div>
            )}
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
              <span>Creating Account...</span>
            </>
          ) : (
            "Sign Up"
          )}
        </button>

        <div className="text-center text-sm text-slate-500 mt-2">
          Already have an account?{" "}
          <a
            href="/signin"
            className="text-blue-600 hover:underline font-semibold"
          >
            Sign in
          </a>
        </div>
      </form>
    </div>
  );
}

export default Signup;
