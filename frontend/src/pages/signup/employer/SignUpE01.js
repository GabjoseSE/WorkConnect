import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupProgress from '../SignupProgress';
import { useSignup } from '../../../contexts/SignupContext';
import '../../signup/signup.css';
import { BsEye, BsEyeSlash } from 'react-icons/bs';

export default function SignUpE01() {
  const navigate = useNavigate();
  const { data, update, setCurrentStep } = useSignup();
  useEffect(() => setCurrentStep(1), [setCurrentStep]);

  const [email, setEmail] = useState(data.email || '');
  const [password, setPassword] = useState(data.password || '');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const onNext = () => {
    setError('');
    if (!email) return setError('Enter a work email');
    if (!password) return setError('Enter a password');
    if (password !== confirm) return setError('Passwords do not match');
    update({ email, password, role: 'employer' });
    navigate('/employer-signup-02');
  };

  return (
    <div className="signup01-container">
  <SignupProgress currentStep={1} steps={["Account","Company","Owner","Verify","Profile"]} />
      <h1 className="signup01-title">Hire talent faster. Create your company account today.</h1>
      <p className="small-note">Use your company email (e.g., name@company.com)</p>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Work email</label>
        <input className="signup01-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" />
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Password</label>
        <div className="input-with-icon">
          <input className="signup01-input" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} />
          <button
            type="button"
            className="eye-toggle-label"
            onClick={() => setShowPassword(s => !s)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <BsEyeSlash /> : <BsEye />}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Confirm password</label>
        <div className="input-with-icon">
          <input className="signup01-input" type={showConfirmPassword ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} />
          <button
            type="button"
            className="eye-toggle-label"
            onClick={() => setShowConfirmPassword(s => !s)}
            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
          >
            {showConfirmPassword ? <BsEyeSlash /> : <BsEye />}
          </button>
        </div>
      </div>

      {error && <div className="signup-error">{error}</div>}

      <div style={{ marginTop: 22 }}>
        <button className="signup01-continue" onClick={onNext}>Next: Company Details</button>
      </div>
    </div>
  );
}
