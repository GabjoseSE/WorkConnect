import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/login";
import Jobs from "./pages/Jobs";
import Landing from "./pages/Landing";
import SignUp01 from "./pages/signup/SignUp01";
import SignUp02 from "./pages/signup/SignUp02";
import SignUp03 from "./pages/signup/SignUp03";
import SignUp04 from "./pages/signup/SignUp04";

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <Link to="/">Home</Link> | {" "}
          <Link to="/jobs">Jobs</Link> | {" "}
          <Link to="/login">Login</Link> | {" "}
          <Link to="/signup-01">Sign Up</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup-01" element={<SignUp01 />} />
          <Route path="/signup-02" element={<SignUp02 />} />
          <Route path="/signup-03" element={<SignUp03 />} />
          <Route path="/signup-04" element={<SignUp04 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
