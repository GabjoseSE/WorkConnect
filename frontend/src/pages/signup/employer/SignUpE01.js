import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupProgress from '../SignupProgress';
import { useSignup } from '../../../contexts/SignupContext';

export default function SignUpE01() {
  const navigate = useNavigate();
  const { setCurrentStep } = useSignup();
  useEffect(() => setCurrentStep(1), [setCurrentStep]);
  return (
    <div style={{ padding: 20 }}>
      <SignupProgress currentStep={1} />
      <h2>Employer Signup — Account</h2>
      <p>This is a minimal placeholder for employer signup step 1.</p>
      <div>
        <button onClick={() => navigate('/employer-signup-02')}>Next</button>
      </div>
    </div>
  );
}
