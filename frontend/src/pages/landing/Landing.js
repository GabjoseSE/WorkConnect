import React from "react";
import { Link } from "react-router-dom";
import "./Landing.css"; // external CSS for styling
import Slideshow from "../../components/Slideshow";
import slide1 from '../../assets/slide1.jpg';
import slide2 from '../../assets/slide2.jpg';
import slide3 from '../../assets/slide3.jpg';

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

        {/* Right-to-left slideshow under the main heading */}
        <Slideshow
          slides={[
            { image: slide1, caption: 'Discover vetted candidates in minutes — filter by skills, location, and experience.' },
            { image: slide2, caption: 'Post jobs for free and receive candidate matches directly in your dashboard.' },
            { image: slide3, caption: 'Employers get smart recommendations; jobseekers get tailored job alerts.' },
          ]}
          duration={9000}
          showCaptions={false}
        />

        {/* CTA buttons removed per request */}
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
