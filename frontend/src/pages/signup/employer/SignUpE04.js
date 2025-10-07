import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupProgress from '../SignupProgress';
import { useSignup } from '../../../contexts/SignupContext';

export default function SignUpE04() {
  const navigate = useNavigate();
  const { setCurrentStep } = useSignup();
  useEffect(() => setCurrentStep(4), [setCurrentStep]);
  return (
    <div style={{ padding: 20 }}>
      <SignupProgress currentStep={4} />
      <h2>Employer Signup — Finish</h2>
      <p>Placeholder to finalize employer signup.</p>
      <div>
        <button onClick={() => navigate('/employer-signup-03')}>Back</button>
        <button onClick={() => navigate('/jobs')} style={{ marginLeft: 8 }}>Finish</button>
      </div>
    </div>
  );
}
