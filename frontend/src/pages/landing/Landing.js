import React from "react";
import { Link } from "react-router-dom";
import "./Landing.css"; // external CSS for styling

function Landing() {
  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">Welcome to WorkConnect</h1>
        <p className="hero-subtitle">
          The platform that connects employers with skilled jobseekers.  
          Find your next opportunity or your next hire today.
        </p>

        {/* CTA buttons */}
        <div className="cta-buttons">
          <Link to="/choose-role">
            <button className="btn-primary">Sign Up</button>
          </Link>
          <Link to="/login">
            <button className="btn-outline">Login</button>
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="divider">or</div>

      {/* Browse Jobs Section */}
      <section className="browse-section">
        <p>
          Want to explore current opportunities?  
          <Link to="/jobs" className="browse-link">Browse Jobs</Link>
        </p>
      </section>
    </div>
  );
}

export default Landing;
