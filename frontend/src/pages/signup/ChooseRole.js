import React from "react";
import { useNavigate } from "react-router-dom";
import "./ChooseRole.css";

export default function ChooseRole() {
  const navigate = useNavigate();

  return (
    <div className="choose-role-container">
      <h1 className="choose-role-title">Join WorkConnect</h1>
      <p className="choose-role-subtitle">Select your role to get started</p>

      <div className="role-buttons">
        <button
          className="role-btn jobhunter-btn"
          onClick={() => navigate("/signup-01")}
        >
          I’m a Job Hunter / Employee
        </button>

        <button
          className="role-btn employer-btn"
          onClick={() => navigate("/employer-signup-01")}
        >
          I’m an Employer / Company
        </button>
      </div>
    </div>
  );
}
