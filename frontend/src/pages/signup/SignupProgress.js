import React from 'react';

function SignupProgress({ currentStep = 1, steps: propSteps }) {
  const defaultSteps = ['Account', 'Personal', 'Background', 'Finish'];
  const steps = Array.isArray(propSteps) && propSteps.length > 0 ? propSteps : defaultSteps;
  const lastIndex = Math.max(1, steps.length - 1);
  // progress line uses 6% left/right insets in CSS; compute usable width accordingly
  const insetPercent = 6; // percent on each side
  const usableWidth = 100 - insetPercent * 2; // percent

  return (
    <div className="signup-progress-steps" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={currentStep}>
      <div className="progress-line" />
      {steps.map((label, i) => {
        const step = i + 1;
        const active = step <= currentStep;
        // map index fraction to usableWidth and add inset offset so dots sit on the visible line
        const fraction = i / lastIndex;
        const left = insetPercent + fraction * usableWidth;
        // vertically center step so dot aligns with progress-line center
        return (
          <div key={label} className={`step ${active ? 'active' : ''}`} style={{ left: `${left}%`, top: '0' }} aria-current={active ? 'step' : undefined}>
            <div className="dot" aria-hidden />
            <div className="label">{label}</div>
          </div>
        );
      })}
    </div>
  );
}

export default SignupProgress;
