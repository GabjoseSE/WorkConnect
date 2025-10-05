import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../contexts/SignupContext";
import "./signup.css";
import SignupProgress from "./SignupProgress";
import { useEffect } from "react";

function SignUp03() {
  const navigate = useNavigate();
  const { data, update, setCurrentStep } = useSignup();
  useEffect(() => setCurrentStep(3), [setCurrentStep]);
  const [headline, setHeadline] = useState(data.headline || '');
  const [experienceYears, setExperienceYears] = useState(data.experienceYears || '');

  const onNext = () => {
    update({ headline, experienceYears });
    navigate('/signup-04');
  };

  return (
    <div className="signup01-container">
      <SignupProgress currentStep={3} />
      <h1 className="signup01-title">Professional details</h1>

      <div style={{ marginTop: 12 }}>
        <label>Professional headline</label>
        <br />
        <input style={{ width: 400 }} value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g. Frontend Developer" />
      </div>

      <div style={{ marginTop: 12 }}>
        <label>Years of experience</label>
        <br />
        <input style={{ width: 120 }} value={experienceYears} onChange={e => setExperienceYears(e.target.value)} placeholder="e.g. 2" />
      </div>

      <div style={{ marginTop: 18 }}>
        <button className="signup01-continue" onClick={() => navigate('/signup-02')} style={{ marginRight: 8 }}>Back</button>
        <button className="signup01-continue" onClick={onNext}>Next</button>
      </div>
    </div>
  );
}

export default SignUp03;
