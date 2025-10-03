import React from "react";
import { useNavigate } from "react-router-dom";

function SignUp02() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: 24 }}>
      <h2>Sign Up - Step 2</h2>
      <p>Additional fields will go here.</p>
      <div style={{ marginTop: 18 }}>
        <button onClick={() => navigate('/signup-01')} style={{ marginRight: 8 }}>Back</button>
        <button onClick={() => navigate('/signup-03')}>Next</button>
      </div>
    </div>
  );
}

export default SignUp02;
