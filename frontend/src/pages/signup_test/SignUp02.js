import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../contexts/SignupContext";
import "./signup.css";
import SignupProgress from "./SignupProgress";
import { useEffect } from "react";

function SignUp02() {
  const navigate = useNavigate();
  const { data, update, setCurrentStep } = useSignup();
  useEffect(() => setCurrentStep(2), [setCurrentStep]);
  const [skills, setSkills] = useState((data.skills || []).join(', '));
  const [resumeFile, setResumeFile] = useState(null);
  const [address] = useState(data.address || '');
  const onContinue = () => {
    const skillsArr = skills.split(',').map(s => s.trim()).filter(Boolean);
    const resumeUrl = resumeFile ? `/uploads/${resumeFile.name}` : data.resumeUrl;

    update({ skills: skillsArr, address, resumeUrl });
    navigate('/signup-03');
  };

  return (
    <div className="signup01-container">
      <SignupProgress currentStep={2} />
      <h1 className="signup01-title">Profile details</h1>
      <p>Current role: <strong>{data.role}</strong></p>

      <div style={{ marginTop: 12 }}>
        <label>Skills (comma separated)</label>
        <br />
        <input style={{ width: 400 }} value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g. React, Node.js, CSS" />
      </div>

      <div style={{ marginTop: 12 }}>
        <label>Upload Resume (PDF)</label>
        <br />
        <input type="file" accept="application/pdf" onChange={e => setResumeFile(e.target.files[0])} />
      </div>

      <div style={{ marginTop: 18 }}>
        <button className="signup01-continue" onClick={() => navigate('/signup-01')} style={{ marginRight: 8 }}>Back</button>
        <button className="signup01-continue" onClick={onContinue}>Continue</button>
      </div>
    </div>
  );
}

export default SignUp02;
