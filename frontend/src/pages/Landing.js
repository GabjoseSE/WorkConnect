import React from "react";
import { Link } from "react-router-dom";

function Landing() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Welcome to WorkConnect</h1>
      <p>
        WorkConnect helps employers find talent and jobseekers find great
        opportunities. Create an account or login to get started.
      </p>

      <div style={{ marginTop: 20 }}>
        <Link to="/signup-01">
          <button style={{ marginRight: 8 }}>Sign Up</button>
        </Link>
        <Link to="/login">
          <button>Login</button>
        </Link>
      </div>

      <hr style={{ margin: "24px 0" }} />

      <p>
        Or browse open jobs: <Link to="/jobs">View Jobs</Link>
      </p>
    </div>
  );
}

export default Landing;
