import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../../contexts/SignupContext";
import { signup, login as apiLogin } from "../../../api/auth";
import { useAuth } from "../../../contexts/AuthContext";
import "../signup.css";
import SignupProgress from "../SignupProgress";
import { useEffect } from "react";

function SignUp04() {
  const navigate = useNavigate();
  const { data, update, setCurrentStep } = useSignup();
  const auth = useAuth();
  useEffect(() => setCurrentStep(4), [setCurrentStep]);
  const [loading, setLoading] = useState(false);
  const [jobType, setJobType] = useState(data.jobType || 'full-time');

  const onFinish = async () => {
    try {
      setLoading(true);
      const payload = { ...data, jobType };
      update({ jobType });
      const result = await signup(payload);
      // store returned profile/userId in signup context
      update({ ...result.profile, userId: result.userId });

      // automatically login so client has a token and profile loaded
      try {
        // prefer using password from signup context if present
        const pw = data.password;
        if (pw) {
          const loginRes = await apiLogin({ email: data.email, password: pw });
          // set auth state
          if (loginRes && loginRes.token) {
            // use auth context setter
            await auth.login(data.email, pw);
          }
        }
      } catch (e) {
        console.warn('Auto-login failed', e);
      }

  // On success, navigate to role-specific dashboard
  // determine role from signup data, result.profile, or auth context
  const role = data.role || result?.profile?.role || auth.profile?.role;
  if (role === 'employer') navigate('/employer/dashboard');
  else navigate('/jobhunter/dashboard');
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Failed to finish signup');
    } finally {
      setLoading(false);
    }
  };

  // verification UI state (accept any code locally)
  const [code, setCode] = useState('');

  const onVerifyAndFinish = async () => {
    if (!code) return alert('Enter verification code');
    // In local/dev mode we accept any code — proceed to finish
    await onFinish();
  };

  return (
    <div className="signup01-container">
      <div className="signup01-header">
        <button className="signup-back-icon" onClick={() => navigate('/signup-03')} aria-label="Go back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M15 18L9 12L15 6" stroke="#233038" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <SignupProgress currentStep={4} />
      </div>
      <h1 className="signup01-title">Finish and Submit</h1>
      <p className="small-note">Review your information below, enter the verification code we sent, then finish signup.</p>

      {/* summary view (readable) */}
      <div className="signup-card" style={{ marginTop: 12 }}>
        <div><strong>Name:</strong> {data.firstName || ''} {data.lastName || ''}</div>
        <div><strong>Email:</strong> {data.email || ''}</div>
        <div><strong>Phone:</strong> {data.phone || ''}</div>
        <div><strong>Location:</strong> {(data.addressLine ? data.addressLine + ', ' : '') + (data.city || '') + (data.stateprovince ? ', ' + data.stateprovince : '') + (data.postalCode ? ' ' + data.postalCode : '')}</div>
        <div><strong>Headline:</strong> {data.headline || ''}</div>
        <div><strong>Skills:</strong> {(data.skills || []).join(', ')}</div>
        <div><strong>Resume:</strong> {data.resumeUrl ? <a href={data.resumeUrl} target="_blank" rel="noreferrer">View</a> : 'Not provided'}</div>
      </div>

      <div className="form-actions">
        <button className="signup01-continue" onClick={onFinish} disabled={loading}>{loading ? 'Saving...' : 'Finish and Continue'}</button>
      </div>
      
    </div>
  );
}

export default SignUp04;
