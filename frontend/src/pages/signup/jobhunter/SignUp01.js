import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../../contexts/SignupContext";
import "../../signup/signup.css"; // go up one level then into signup folder
import SignupProgress from "../../signup/SignupProgress";
// ...existing code...
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { sendCode, verifyCode } from '../../../api/verify';


function SignUp01() {
  const { data, update, setCurrentStep } = useSignup();
  const navigate = useNavigate();

  /*
    Design notes:
    - Global signup styles are in `frontend/src/pages/signup/signup.css`.
    - Key classes to edit design/typography/layout:
      * `.signup01-container`  -> overall container width, margin, padding
      * `.signup01-title`      -> page title font-size, weight, spacing
      * `.signup01-label`      -> field label font-size and spacing
      * `.signup01-input`      -> input height, padding, font-size, border
      * `.signup01-continue`   -> primary button size, color, border-radius
      * `.small-note`          -> help/notice text size and color
      * `.input-with-icon`     -> input + icon positioning (eye toggle)
    - For responsive adjustments, edit the `@media (max-width: ...)` blocks in the same file.
    - If you want a theme-level change, consider adding CSS variables at the top of signup.css
      (e.g. --signup-font-size, --signup-accent-color) and reference them in the selectors.
  */

  // state for phone error display (not used in this step)
  // state for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  // separate toggle for confirm password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [emailError, setEmailError] = useState('');

  // handle input changes
  const onChange = (e) => update({ [e.target.name]: e.target.value });

  // handle form submission
  const onSubmit = async (e) => {
    e.preventDefault();

    // basic email + password validation
    // clear errors
    setPasswordError('');
    setConfirmError('');
    setEmailError('');

    if (!data.email) {
      setEmailError('Please enter your email');
    } else {
      // simple email regex
      const emailRe = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
      if (!emailRe.test(data.email)) setEmailError('Please enter a valid email');
    }

    if (!data.password) {
      setPasswordError('Password is required');
    } else if (data.password.length < 8 || !/[0-9]/.test(data.password) || !/[A-Za-z]/.test(data.password)) {
      setPasswordError('Password must be at least 8 characters and include letters and numbers');
    }
    if (data.password !== data.confirmPassword) {
      setConfirmError('Passwords do not match');
      return;
    }

    // prevent submit if any errors
    if (emailError || passwordError || confirmError || !data.email || !data.password || emailError || passwordError) return;

    // send verification code to email and show OTP input
    try {
      const resp = await sendCode(data.email, 'email');
      // server in debug mode may return the code; we don't display it except in dev/debug
      setShowOtp(true);
      setOtpMessage(resp?.message || 'A verification code was sent to your email');
      // keep user on this page until they verify
    } catch (err) {
      setEmailError('Failed to send verification code. Please try again later.');
      return;
    }
  };

  // mark current step for progress bar
  useEffect(() => setCurrentStep(1), [setCurrentStep]);

  // OTP UI state + resend timer
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpMessage, setOtpMessage] = useState('');

  // resend timer (seconds)
  const RESEND_SECONDS = 60; // seconds before user can resend
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const timerRef = React.useRef(null);

  const startTimer = () => {
    setRemainingSeconds(RESEND_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRemainingSeconds(s => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const onVerifyOtp = async () => {
    setOtpError('');
    if (!otp) return setOtpError('Enter the verification code');
    try {
      const res = await verifyCode(data.email, otp);
      if (res.valid) {
        // mark verified in signup context and proceed
        update({ emailVerified: true });
        navigate('/signup-02');
      } else {
        setOtpError('Invalid or expired code');
      }
    } catch (err) {
      setOtpError('Verification failed. Try again');
    }
  };

  // resend handler
  const onResend = async () => {
    if (remainingSeconds > 0) return;
    try {
      const resp = await sendCode(data.email, 'email');
      setOtpMessage(resp?.message || 'A verification code was resent to your email');
      startTimer();
    } catch (err) {
      setOtpError('Failed to resend code. Try again later');
    }
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="signup01-container">
      <div className="signup01-header">
        <button className="signup-back-icon" aria-label="Exit signup" onClick={() => navigate('/choose-role') }>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M15 18L9 12L15 6" stroke="#233038" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <SignupProgress currentStep={1} />
      </div>

      <h1 className="signup01-title">Give Us Your Primary Information</h1>

      <form onSubmit={onSubmit}>
        <div className="signup01-grid">
          <div>
            <label className="signup01-label">Email*</label>
            <input
              className={`signup01-input ${emailError ? 'invalid-input' : ''}`}
              name="email"
              value={data.email}
              onChange={(e) => { setEmailError(''); onChange(e); }}
              placeholder="example@email.com"
            />
            {emailError && <div className="signup-error">{emailError}</div>}
          </div>

          {/* password field with show/hide toggle */}
          <div>
            <label className="signup01-label">Password*</label>

            <div className="input-with-icon">
              <input
                className={`signup01-input ${passwordError ? 'invalid-input' : ''}`}
                name="password"
                value={data.password}
                onChange={(e) => { setPasswordError(''); onChange(e); }}
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                aria-label="Password"
              />
              <button
                type="button"
                className="eye-toggle-label"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <BsEyeSlash /> : <BsEye />}
              </button>
            </div>
            {passwordError && <div className="signup-error">{passwordError}</div>}
          </div>

          <div>
            <label className="signup01-label">Confirm Password*</label>

            <div className="input-with-icon">
              <input
                className="signup01-input"
                name="confirmPassword"
                value={data.confirmPassword || ''}
                onChange={onChange}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                aria-label="Confirm password"
              />
              <button
                type="button"
                className="eye-toggle-label"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <BsEyeSlash /> : <BsEye />}
              </button>
            </div>
            {confirmError && <div className="signup-error">{confirmError}</div>}
          </div>

        </div>

        <div style={{ marginTop: 18 }}>
          {!showOtp && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <p className="small-note" style={{ textAlign: 'center', maxWidth: 500 }}>By clicking <strong>Agree &amp; Join</strong> or Continue, you agree to the Work Connect Terms and Privacy Policy.</p>
                  <div className="form-actions" style={{ width: '100%', justifyContent: 'center' }}>
                    <button className="signup01-continue" type="submit">
                      Agree &amp; Join
                    </button>
                  </div>
              </div>

              <div style={{ marginTop: 12, textAlign: 'center' }}>
                <span className="small-note">Already on Work Connect? </span>
                <button type="button" className="secondary-btn" onClick={() => navigate('/login')} style={{ marginLeft: 8 }}>Sign in</button>
              </div>
            </>
          )}

          {showOtp && (
            <div style={{ marginTop: 12 }}>
              <label className="signup01-label">Verification code</label>
              <input className={`signup01-input ${otpError ? 'invalid-input' : ''}`} placeholder="Enter code" value={otp} onChange={e => { setOtpError(''); setOtp(e.target.value) }} />
              {otpError && <div className="signup-error">{otpError}</div>}
              {otpMessage && <div className="small-note">{otpMessage}</div>}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                <button className="secondary-btn" type="button" onClick={onResend} disabled={remainingSeconds > 0}>
                  {remainingSeconds > 0 ? `Resend (${remainingSeconds}s)` : 'Resend code'}
                </button>
              </div>
              <div className="form-actions">
                <button className="signup01-continue" onClick={onVerifyOtp}>Verify &amp; Continue</button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default SignUp01;
