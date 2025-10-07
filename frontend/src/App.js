// Import React to define a component
import React from "react";

// Import routing tools from react-router-dom
// BrowserRouter (as Router) wraps the whole app and enables routing
// Routes holds all route definitions
// Route maps a URL path to a specific page component
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import all page components used in the app
import Login from "./pages/login/login";
import Jobs from "./pages/Jobs";
import Landing from "./pages/Landing";
import SignUp01 from "./pages/signup/SignUp01";
import SignUp02 from "./pages/signup/SignUp02";
import SignUp03 from "./pages/signup/SignUp03";
import SignUp04 from "./pages/signup/SignUp04";

// Import the site header (navbar)
import Header from "./components/Header";

// The main App component that defines routing and layout
function App() {
  return (
    // Router enables navigation without reloading the page
    <Router>
      {/* Main container for the app */}
      <div className="App">
        {/* Header component stays visible across all pages */}
        <Header />

        {/* Routes define which page to show for each URL */}
        <Routes>
          {/* When user visits '/', show Landing page */}
          <Route path="/" element={<Landing />} />

          {/* When user visits '/jobs', show Jobs page */}
          <Route path="/jobs" element={<Jobs />} />

          {/* When user visits '/login', show Login page */}
          <Route path="/login" element={<Login />} />

          {/* Signup process split into multiple steps (01–04) */}
          <Route path="/signup-01" element={<SignUp01 />} />
          <Route path="/signup-02" element={<SignUp02 />} />
          <Route path="/signup-03" element={<SignUp03 />} />
          <Route path="/signup-04" element={<SignUp04 />} />
        </Routes>
      </div>
    </Router>
  );
}

// Export App so index.js can render it in the browser
export default App;
