import React from "react";
import { useNavigate } from "react-router-dom";

function SignUp04() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: 24 }}>
      <h2>Sign Up - Step 4</h2>
      <p>Final step placeholder.</p>
      <div style={{ marginTop: 18 }}>
        <button onClick={() => navigate('/signup-03')} style={{ marginRight: 8 }}>Back</button>
        <button onClick={() => navigate('/jobs')}>Finish</button>
      </div>
    </div>
  );
}

export default SignUp04;
