import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../../contexts/SignupContext";
import "../../signup/signup.css"; // go up one level then into signup folder
import SignupProgress from "../../signup/SignupProgress";
// ...existing code...
import { BsEye, BsEyeSlash } from "react-icons/bs";


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

    // proceed to personal info step
    navigate('/signup-02');
  };

  // mark current step for progress bar
  useEffect(() => setCurrentStep(1), [setCurrentStep]);

  return (
    <div className="signup01-container">
      {/* top progress indicator */}
      <SignupProgress currentStep={1} />

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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <p className="small-note" style={{ textAlign: 'center', maxWidth: 500 }}>By clicking <strong>Agree &amp; Join</strong> or Continue, you agree to the LinkedIn User Agreement, Privacy Policy, and Cookie Policy.</p>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <button className="signup01-continue" type="submit" style={{ margin: '0 auto' }}>
                Agree &amp; Join
              </button>
            </div>
          </div>

          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <span className="small-note">Already on Work Connect? </span>
            <button type="button" className="secondary-btn" onClick={() => navigate('/login')} style={{ marginLeft: 8 }}>Sign in</button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default SignUp01;
