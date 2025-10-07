import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupProgress from '../SignupProgress';
import { useSignup } from '../../../contexts/SignupContext';

export default function SignUpE03() {
  const navigate = useNavigate();
  const { setCurrentStep } = useSignup();
  useEffect(() => setCurrentStep(3), [setCurrentStep]);
  return (
    <div style={{ padding: 20 }}>
      <SignupProgress currentStep={3} />
      <h2>Employer Signup — Team & Contacts</h2>
      <p>Placeholder for employer team & contact information.</p>
      <div>
        <button onClick={() => navigate('/employer-signup-02')}>Back</button>
        <button onClick={() => navigate('/employer-signup-04')} style={{ marginLeft: 8 }}>Next</button>
      </div>
    </div>
  );
}
