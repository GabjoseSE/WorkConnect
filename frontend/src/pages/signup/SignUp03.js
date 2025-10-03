import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../contexts/SignupContext";

function SignUp03() {
  const navigate = useNavigate();
  const { data, update } = useSignup();
  const [headline, setHeadline] = useState(data.headline || '');
  const [experience, setExperience] = useState(data.experience || '');

  const onNext = () => {
    update({ headline, experience });
    navigate('/signup-04');
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Sign Up - Professional</h2>

      <div style={{ marginTop: 12 }}>
        <label>Professional headline</label>
        <br />
        <input style={{ width: 400 }} value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g. Frontend Developer" />
      </div>

      <div style={{ marginTop: 12 }}>
        <label>Years of experience</label>
        <br />
        <input style={{ width: 120 }} value={experience} onChange={e => setExperience(e.target.value)} placeholder="e.g. 2" />
      </div>

      <div style={{ marginTop: 18 }}>
        <button onClick={() => navigate('/signup-02')} style={{ marginRight: 8 }}>Back</button>
        <button onClick={onNext}>Next</button>
      </div>
    </div>
  );
}

export default SignUp03;
