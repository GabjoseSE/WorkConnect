import React, { useState } from "react"; // Import React and useState hook for state management
import "./Login.css"; // Import CSS for styling the login page
import { Link } from "react-router-dom";// Import Link from react-router-dom for navigation between pages

function Login() {
  // React state variables to store selected role, email, and password
  const [role, setRole] = useState("jobseeker"); // default role is jobseeker
  const [email, setEmail] = useState("");        // stores user email input
  const [password, setPassword] = useState("");  // stores user password input

  // Handles form submission
  const onSubmit = (e) => {
    e.preventDefault(); // prevents default page reload
    console.log("Login payload:", { role, email, password }); // logs data to console
    alert("Login payload logged to console. See devtools.");  // alerts user for demo
  };

  return (
    // Outer container for page layout
    <div className="login-container">
      {/* Card element for centered login form */}
      <div className="login-card">
        {/* App title and subtitle */}
        <h2 className="login-title">WorkConnect</h2>
        <p className="login-subtitle">Sign in to your account</p>

        {/* Role selection (Jobseeker or Employer) */}
        <div className="role-toggle">
          <label className={role === "jobseeker" ? "active" : ""}>
            <input
              type="radio"
              name="role"
              value="jobseeker"
              checked={role === "jobseeker"}      // highlights selected option
              onChange={() => setRole("jobseeker")} // updates state when clicked
            />
            Jobseeker
          </label>
          <label className={role === "employer" ? "active" : ""}>
            <input
              type="radio"
              name="role"
              value="employer"
              checked={role === "employer"}
              onChange={() => setRole("employer")}
            />
            Employer
          </label>
        </div>

        {/* Form inputs for login credentials */}
        <form onSubmit={onSubmit}>
          {/* Email input field */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            className="input-field"
            onChange={(e) => setEmail(e.target.value)} // updates email state
            required
          />
          {/* Password input field */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            className="input-field"
            onChange={(e) => setPassword(e.target.value)} // updates password state
            required
          />
          {/* Submit button that displays current selected role */}
          <button type="submit" className="login-btn">
            Login as {role}
          </button>
        </form>

        {/* Links for extra actions */}
        <div className="login-links">
          <a href="#">Forgot password?</a>
          {/* React Router link to signup page */}
          <Link to="/signup-01">Create account</Link>
        </div>
      </div>
    </div>
  );
}

// Export component so it can be used in App.js
export default Login;
