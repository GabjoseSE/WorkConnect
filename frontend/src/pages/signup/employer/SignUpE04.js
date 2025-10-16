import React, { useEffect, useState, useRef } from 'react';
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
  const [codeError, setCodeError] = useState('');
  const codeRef = useRef(null);

  const onVerify = () => {
    setCodeError('');
    if (!code) { setCodeError('Please enter the verification code'); if (codeRef.current) { codeRef.current.focus(); codeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); } return; }
    // dev: accept any code
    update({ verified: true });
    navigate('/employer-signup-05');
  };

  return (
    <div className="signup01-container">
      <div className="signup01-header">
        <button className="signup-back-icon" onClick={() => navigate('/employer-signup-03')} aria-label="Go back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M15 18L9 12L15 6" stroke="#233038" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <SignupProgress currentStep={4} steps={["Account","Company","Owner","Verify","Profile"]} />
      </div>
      <h1 className="signup01-title">Verify your company</h1>
      <p className="small-note">Choose a verification method to confirm your company identity.</p>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Method</label>
        <select className="signup01-input" value={method} onChange={e => setMethod(e.target.value)}>
          <option value="email">Email domain verification</option>
          <option value="phone">Phone verification (OTP)</option>
        </select>
      </div>

      <div style={{ marginTop: 22 }}>
        <button className="signup01-continue" onClick={() => navigate('/employer-signup-05')}>Continue</button>
      </div>
    </div>
  );
}
