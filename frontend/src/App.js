// Import React to define a component
import React from "react";

// Import routing tools from react-router-dom
// BrowserRouter (as Router) wraps the whole app and enables routing
// Routes holds all route definitions
// Route maps a URL path to a specific page component
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import all page components used in the app
import Login from "./pages/login/login";
import ForgotPass from "./pages/login/forgotpass";
import Jobs from "./pages/jobhunter_dashboard/Jobs";
import Landing from "./pages/landing/Landing";
import SignUp01 from "./pages/signup/jobhunter/SignUp01";
import SignUp02 from "./pages/signup/jobhunter/SignUp02";
import SignUp04 from "./pages/signup/jobhunter/SignUp04";
import ChooseRole from "./pages/signup/ChooseRole";
import SignUpE01 from "./pages/signup/employer/SignUpE01";
import SignUpE02 from "./pages/signup/employer/SignUpE02";
import SignUpE03 from "./pages/signup/employer/SignUpE03";
import JobhunterDashboard from './pages/jobhunter_dashboard/JobhunterDashboard';
import EmployerDashboard from './pages/employer_dashboard/EmployerDashboard';
import EmployerLayout from './pages/employer_dashboard/EmployerLayout';
import EmployerProfile from './pages/employer_dashboard/EmployerProfile';
import EmployerJobs from './pages/employer_dashboard/JobPosting';
import EmployerApplicants from './pages/employer_dashboard/Applicants';
import EmployerMessages from './pages/employer_dashboard/EmployerMessages';
import EmployerNotifications from './pages/employer_dashboard/Notifications';
import EmployerAnalytics from './pages/employer_dashboard/Analytics';
import EmployerSettings from './pages/employer_dashboard/Settings';
import EmployerHelp from './pages/employer_dashboard/Help';
import DashboardLayout from './pages/jobhunter_dashboard/DashboardLayout';
import Profile from './pages/jobhunter_dashboard/Profile';
import SavedJobs from './pages/jobhunter_dashboard/SavedJobs';
import Applications from './pages/jobhunter_dashboard/Applications';
import Notifications from './pages/jobhunter_dashboard/Notifications';
import Messages from './pages/jobhunter_dashboard/Messages';
import Settings from './pages/jobhunter_dashboard/Settings';

// Import the site header (navbar)
import Header from "./components/Header";
import Footer from "./components/Footer";
import { useAuth } from './contexts/AuthContext';
import { JobsProvider } from './contexts/JobsContext';

// The main App component that defines routing and layout
function App() {
  const { token } = useAuth();
  return (
    // Router enables navigation without reloading the page
    <JobsProvider>
      <Router>
        {/* Main container for the app */}
        <div className="App">
          {/* Header component stays visible across all pages */}
          <Header />

          {/* Routes define which page to show for each URL */}
          <Routes>
          {/* When user visits '/', show Landing page */}
          <Route path="/" element={<Landing />} />

          {/* Dashboard routes for roles */}
          <Route path="/employer" element={<EmployerLayout />}>
            <Route path="dashboard" element={<EmployerDashboard />} />
            <Route path="profile" element={<EmployerProfile />} />
            <Route path="jobPosting" element={<EmployerJobs />} />
            <Route path="applicants" element={<EmployerApplicants />} />
            <Route path="messages" element={<EmployerMessages />} />
            <Route path="notifications" element={<EmployerNotifications />} />
            <Route path="analytics" element={<EmployerAnalytics />} />
            <Route path="settings" element={<EmployerSettings />} />
            <Route path="help" element={<EmployerHelp />} />
          </Route>
          {/* Jobhunter dashboard (uses a layout with persistent sidebar) */}
          <Route path="/jobhunter" element={<DashboardLayout />}>
            <Route path="dashboard" element={<JobhunterDashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="saved-jobs" element={<SavedJobs />} />
            <Route path="applications" element={<Applications />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="messages" element={<Messages />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* When user visits '/login', show Login page */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPass />} />

          {/* Signup process split into multiple steps (01–04) */}
          <Route path="/signup-01" element={<SignUp01 />} />
          <Route path="/signup-02" element={<SignUp02 />} />
          {/* Step 3 removed — professional details moved into profile page. */}
          <Route path="/signup-04" element={<SignUp04 />} />
          <Route path="/choose-role" element={<ChooseRole />} />
            {/* Employer signup flow */}
            <Route path="/employer-signup-01" element={<SignUpE01 />} />
            <Route path="/employer-signup-02" element={<SignUpE02 />} />
            <Route path="/employer-signup-03" element={<SignUpE03 />} />
        </Routes>

          {/* Site footer: hide when user is logged in */}
          {!token && <Footer />}
        </div>
      </Router>
    </JobsProvider>
  );
}

// Export App so index.js can render it in the browser
export default App;
