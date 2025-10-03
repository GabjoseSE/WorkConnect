import React from "react";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../contexts/SignupContext";

function SignUp02() {
  const navigate = useNavigate();
  const { data } = useSignup();
  return (
    <div style={{ padding: 24 }}>
      <h2>Sign Up - Step 2</h2>
      <p>Current role: <strong>{data.role}</strong></p>
      <p>Additional fields will go here.</p>
      <div style={{ marginTop: 18 }}>
        <button onClick={() => navigate('/signup-01')} style={{ marginRight: 8 }}>Back</button>
        <button onClick={() => navigate('/signup-03')}>Next</button>
      </div>
    </div>
  );
}

export default SignUp02;
