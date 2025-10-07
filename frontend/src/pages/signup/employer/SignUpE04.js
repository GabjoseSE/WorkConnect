import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupProgress from '../SignupProgress';
import { useSignup } from '../../../contexts/SignupContext';
import '../../signup/signup.css';

export default function SignUpE04() {
  const navigate = useNavigate();
  const { data, update, setCurrentStep } = useSignup();
  useEffect(() => setCurrentStep(4), [setCurrentStep]);

  const [method, setMethod] = useState('email');
  const [code, setCode] = useState('');

  const onVerify = () => {
    // dev: accept any code
    update({ verified: true });
    navigate('/employer-signup-05');
  };

  return (
    <div className="signup01-container">
  <SignupProgress currentStep={4} steps={["Account","Company","Owner","Verify","Profile"]} />
      <h1 className="signup01-title">Verify your company</h1>
      <p className="small-note">Choose a verification method to confirm your company identity.</p>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Method</label>
        <select className="signup01-input" value={method} onChange={e => setMethod(e.target.value)}>
          <option value="email">Email domain verification</option>
          <option value="phone">Phone verification (OTP)</option>
        </select>
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Verification code</label>
        <input className="signup01-input" value={code} onChange={e => setCode(e.target.value)} placeholder="Enter code" />
        <div className="small-note" style={{ marginTop: 8 }}>{method === 'email' ? `We sent a code to ${data.email || 'your company email'}` : 'We sent an OTP to the provided business phone number.'}</div>
      </div>

      <div style={{ marginTop: 22 }}>
        <button className="signup01-continue" onClick={() => navigate('/employer-signup-03')} style={{ marginRight: 8 }}>Back</button>
        <button className="signup01-continue" onClick={onVerify}>Verify & Continue</button>
      </div>
    </div>
  );
}
