import React, { useState } from "react";

function Login() {
  const [role, setRole] = useState("jobseeker");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    console.log("Login payload:", { role, email, password });
    alert("Login payload logged to console. See devtools.");
  };

  return (
    <div>
      <h2>Login</h2>

      <div style={{ marginBottom: 12 }}>
        <label style={{ marginRight: 8 }}>
          <input
            type="radio"
            name="role"
            value="jobseeker"
            checked={role === "jobseeker"}
            onChange={() => setRole("jobseeker")}
          />
          Jobseeker
        </label>
        <label>
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

      <form onSubmit={onSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button type="submit">Login as {role}</button>
      </form>
    </div>
  );
}

export default Login;