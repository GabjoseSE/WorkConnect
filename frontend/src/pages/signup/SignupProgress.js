import React from 'react';

function SignupProgress({ currentStep = 1, total = 4 }) {
  const steps = ['Account', 'Personal', 'Experience', 'Finish'];
  return (
    <div className="signup-progress-steps" aria-hidden>
      <div className="progress-line" />
      {steps.map((label, i) => {
        const step = i + 1;
        const active = step <= currentStep;
        return (
          <div key={label} className={`step ${active ? 'active' : ''}`} style={{ left: `${(i/(steps.length-1))*100}%` }}>
            <div className="dot" />
            <div className="label">{label}</div>
          </div>
        );
      })}
    </div>
  );
}

export default SignupProgress;
