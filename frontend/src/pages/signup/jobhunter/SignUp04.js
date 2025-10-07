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
      <SignupProgress currentStep={4} />
      <h1 className="signup01-title">Finalize your profile</h1>
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

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Preferred job type</label>
        <br />
        <select className="signup01-input" value={jobType} onChange={e => setJobType(e.target.value)}>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="remote">Remote</option>
        </select>
      </div>

      {/* verification code input + resend */}
      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Verification code</label>
        <br />
        <input className="signup01-input" placeholder="Enter code" value={code} onChange={e => setCode(e.target.value)} />
        <div style={{ marginTop: 8 }}>
          <span className="small-note">Enter the code you received (local dev accepts any code).</span>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <button className="signup01-continue" onClick={() => navigate('/signup-03')} style={{ marginRight: 8 }}>Back</button>
        <button className="signup01-continue" onClick={onVerifyAndFinish} disabled={loading}>{loading ? 'Saving...' : 'Verify & Finish'}</button>
      </div>
    </div>
  );
}

export default SignUp04;
