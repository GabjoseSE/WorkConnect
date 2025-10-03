import React from "react";
import { useNavigate } from "react-router-dom";

function SignUp03() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: 24 }}>
      <h2>Sign Up - Step 3</h2>
      <p>Additional fields will go here.</p>
      <div style={{ marginTop: 18 }}>
        <button onClick={() => navigate('/signup-02')} style={{ marginRight: 8 }}>Back</button>
        <button onClick={() => navigate('/signup-04')}>Next</button>
      </div>
    </div>
  );
}

export default SignUp03;
