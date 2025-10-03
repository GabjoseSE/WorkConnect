import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../contexts/SignupContext";
import { saveProfile } from "../../api/profile";
import "./signup.css";
import SignupProgress from "./SignupProgress";
import { useEffect } from "react";

function SignUp04() {
  const navigate = useNavigate();
  const { data, update, setCurrentStep } = useSignup();
  useEffect(() => setCurrentStep(4), [setCurrentStep]);
  const [loading, setLoading] = useState(false);
  const [jobType, setJobType] = useState(data.jobType || 'full-time');

  const onFinish = async () => {
    try {
      setLoading(true);
      const payload = { ...data, jobType };
      update({ jobType });
      await saveProfile(payload);
      navigate('/jobs');
    } catch (err) {
      console.error(err);
      alert('Failed to finish signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup01-container">
      <SignupProgress currentStep={4} />
      <h1 className="signup01-title">Finalize your profile</h1>
      <p>Review your information and finish signup.</p>
      <pre style={{ background: '#fafafa', padding: 12 }}>{JSON.stringify(data, null, 2)}</pre>

      <div style={{ marginTop: 12 }}>
        <label>Preferred job type</label>
        <br />
        <select value={jobType} onChange={e => setJobType(e.target.value)}>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="remote">Remote</option>
        </select>
      </div>
      <div style={{ marginTop: 18 }}>
        <button className="signup01-continue" onClick={() => navigate('/signup-03')} style={{ marginRight: 8 }}>Back</button>
        <button className="signup01-continue" onClick={onFinish} disabled={loading}>{loading ? 'Saving...' : 'Finish'}</button>
      </div>
    </div>
  );
}

export default SignUp04;
