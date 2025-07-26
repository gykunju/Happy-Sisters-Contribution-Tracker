import { useState } from "react";
import { useUser } from '../context/UserContext'

function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

    const { signUp } = useUser()

  function handleSignup(e) {
    e.preventDefault();
    const [firstName, lastName] = fullName.split(" ")
    const formData = {
        email: email,
        password: password,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName
            }
        }
    }

    signUp(formData)
  }

  return (
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-100 py-8 px-2">
      <form
        onSubmit={handleSignup}
        class="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md flex flex-col gap-6 border border-slate-200"
      >
        <div class="flex flex-col items-center mb-2">
          <div class="bg-blue-100 rounded-full p-3 mb-2">
            {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              class="w-8 h-8 text-blue-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25v-1.5A2.25 2.25 0 016.75 16.5h10.5a2.25 2.25 0 012.25 2.25v1.5"
              />
            </svg> */}
          </div>
          <h2 class="text-3xl font-extrabold text-blue-700">Sign Up</h2>
          <p class="text-slate-500 text-sm mt-1">
            Create your account to get started.
          </p>
        </div>
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-1">
            <label htmlFor="fullName" class="font-semibold text-slate-700">
              Full Name
            </label>
            <input
              id="fullName"
              placeholder="Enter Full Name"
              value={fullName}
              type="text"
              onChange={(e) => setFullName(e.target.value)}
              class="border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label htmlFor="email" class="font-semibold text-slate-700">
              Email
            </label>
            <input
              id="email"
              placeholder="Enter Email"
              value={email}
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              class="border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label htmlFor="password" class="font-semibold text-slate-700">
              Password
            </label>
            <input
              id="password"
              placeholder="Enter Password"
              value={password}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              class="border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
            />
          </div>
        </div>
        <button
          type="submit"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition mt-2"
        >
          Sign Up
        </button>
        <div class="text-center text-sm text-slate-500 mt-2">
          Already have an account?{" "}
          <a href="/signin" class="text-blue-600 hover:underline font-semibold">
            Sign in
          </a>
        </div>
      </form>
    </div>
  );
}

export default Signup;
