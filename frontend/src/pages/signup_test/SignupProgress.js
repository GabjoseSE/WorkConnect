import React from 'react';

function SignupProgress({ currentStep = 1, total = 4 }) {
  const pct = Math.round((currentStep - 1) / (total - 1) * 100);

  return (
    <div className="signup01-progress" aria-hidden>
      <div className="bar" style={{ width: `${Math.max(6, pct)}%` }} />
    </div>
  );
}

export default SignupProgress;
