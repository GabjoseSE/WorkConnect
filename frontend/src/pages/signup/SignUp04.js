import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../contexts/SignupContext";
import { saveProfile } from "../../api/profile";

function SignUp04() {
  const navigate = useNavigate();
  const { data } = useSignup();
  const [loading, setLoading] = useState(false);

  const onFinish = async () => {
    try {
      setLoading(true);
      await saveProfile(data);
      navigate('/jobs');
    } catch (err) {
      console.error(err);
      alert('Failed to finish signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Sign Up - Final</h2>
      <p>Review your information and finish signup.</p>
      <pre style={{ background: '#fafafa', padding: 12 }}>{JSON.stringify(data, null, 2)}</pre>
      <div style={{ marginTop: 18 }}>
        <button onClick={() => navigate('/signup-03')} style={{ marginRight: 8 }}>Back</button>
        <button onClick={onFinish} disabled={loading}>{loading ? 'Saving...' : 'Finish'}</button>
      </div>
    </div>
  );
}

export default SignUp04;
