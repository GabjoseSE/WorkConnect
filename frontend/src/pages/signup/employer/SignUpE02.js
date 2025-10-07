import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupProgress from '../SignupProgress';
import { useSignup } from '../../../contexts/SignupContext';

export default function SignUpE02() {
  const navigate = useNavigate();
  const { setCurrentStep } = useSignup();
  useEffect(() => setCurrentStep(2), [setCurrentStep]);
  return (
    <div style={{ padding: 20 }}>
      <SignupProgress currentStep={2} />
      <h2>Employer Signup — Company Details</h2>
      <p>Placeholder for employer company details.</p>
      <div>
        <button onClick={() => navigate('/employer-signup-01')}>Back</button>
        <button onClick={() => navigate('/employer-signup-03')} style={{ marginLeft: 8 }}>Next</button>
      </div>
    </div>
  );
}
