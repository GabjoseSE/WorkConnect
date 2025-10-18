import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupProgress from '../SignupProgress';
import { useSignup } from '../../../contexts/SignupContext';
import '../../signup/signup.css';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import { sendCode, verifyCode } from '../../../api/verify';

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
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [emailError, setEmailError] = useState('');
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);

  const onNext = () => {
    setError('');
    setPasswordError('');
    setConfirmError('');
    setEmailError('');
  if (!email) { setEmailError('Enter a work email'); if (emailRef.current) { emailRef.current.focus(); emailRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); } return; }
    // simple email check
    const emailRe = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
    if (!emailRe.test(email)) {
      setEmailError('Please enter a valid work email');
      if (emailRef.current) { emailRef.current.focus(); emailRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      return;
    }
    if (!password) { setPasswordError('Enter a password'); return; }
    if (password.length < 8 || !/[0-9]/.test(password) || !/[A-Za-z]/.test(password)) {
      setPasswordError('Password must be at least 8 characters and include letters and numbers');
      if (passwordRef.current) { passwordRef.current.focus(); passwordRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      return;
    }
  if (password !== confirm) { setConfirmError('Passwords do not match'); if (confirmRef.current) { confirmRef.current.focus(); confirmRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); } return; }
    update({ email, password, role: 'employer' });
    // send OTP and require verification before proceeding
    (async () => {
      try {
        const resp = await sendCode(email, 'email');
        setShowOtp(true);
        setOtpMessage(resp?.message || 'A verification code was sent to your email');
      } catch (err) {
        setEmailError('Failed to send verification code');
      }
    })();
  };

  // OTP state
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpMessage, setOtpMessage] = useState('');

  const onVerifyOtp = async () => {
    setOtpError('');
    if (!otp) return setOtpError('Enter the verification code');
    try {
      const res = await verifyCode(email, otp);
      if (res.valid) {
        update({ emailVerified: true });
        navigate('/employer-signup-02');
      } else {
        setOtpError('Invalid or expired code');
      }
    } catch (err) {
      setOtpError('Verification failed. Try again');
    }
  };

  return (
    <div className="signup01-container">
      <div className="signup01-header">
        <button className="signup-back-icon" onClick={() => navigate('/choose-role')} aria-label="Go back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M15 18L9 12L15 6" stroke="#233038" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
  <SignupProgress currentStep={1} steps={["Account","Company","Owner","Profile"]} />
      </div>
      <h1 className="signup01-title">Hire talent faster. Create your company account today.</h1>
      <p className="small-note">Use your company email (e.g., name@company.com)</p>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Work email</label>
        <input ref={emailRef} className={`signup01-input ${emailError ? 'invalid-input' : ''}`} value={email} onChange={e => { setEmailError(''); setEmail(e.target.value) }} placeholder="name@company.com" />
        {emailError && <div className="signup-error">{emailError}</div>}
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Password</label>
        <div className="input-with-icon">
          <input ref={passwordRef} className={`signup01-input ${passwordError ? 'invalid-input' : ''}`} type={showPassword ? 'text' : 'password'} value={password} onChange={e => { setPasswordError(''); setPassword(e.target.value) }} />
          <button
            type="button"
            className="eye-toggle-label"
            onClick={() => setShowPassword(s => !s)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <BsEyeSlash /> : <BsEye />}
          </button>
        </div>
        {passwordError && <div className="signup-error">{passwordError}</div>}
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Confirm password</label>
        <div className="input-with-icon">
          <input ref={confirmRef} className={`signup01-input ${confirmError ? 'invalid-input' : ''}`} type={showConfirmPassword ? 'text' : 'password'} value={confirm} onChange={e => { setConfirmError(''); setConfirm(e.target.value) }} />
          <button
            type="button"
            className="eye-toggle-label"
            onClick={() => setShowConfirmPassword(s => !s)}
            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
          >
            {showConfirmPassword ? <BsEyeSlash /> : <BsEye />}
          </button>
        </div>
        {confirmError && <div className="signup-error">{confirmError}</div>}
      </div>

      {error && <div className="signup-error">{error}</div>}

      <div style={{ marginTop: 22 }}>
        {!showOtp && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="signup01-continue" onClick={onNext}>Next</button>
          </div>
        )}

        {showOtp && (
          <div>
            <label className="signup01-label">Verification code</label>
            <input
              className={`signup01-input ${otpError ? 'invalid-input' : ''}`}
              placeholder="Enter code"
              value={otp}
              onChange={e => { setOtpError(''); setOtp(e.target.value); }}
            />
            {otpError && <div className="signup-error">{otpError}</div>}
            {otpMessage && <div className="small-note">{otpMessage}</div>}
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="signup01-continue" onClick={onVerifyOtp}>Verify &amp; Continue</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
