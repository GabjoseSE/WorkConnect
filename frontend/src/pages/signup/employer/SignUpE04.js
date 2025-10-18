import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupProgress from '../SignupProgress';
import { useSignup } from '../../../contexts/SignupContext';
import { signup, login as apiLogin } from '../../../api/auth';
import { useAuth } from '../../../contexts/AuthContext';
import '../../signup/signup.css';

export default function SignUpE04() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { data, update, setCurrentStep } = useSignup();
  useEffect(() => setCurrentStep(4), [setCurrentStep]);

  const [logoPreview, setLogoPreview] = useState(data.companyLogo || '');
  const [description, setDescription] = useState(data.companyDescription || '');
  const [linkedin, setLinkedin] = useState(data.linkedin || '');
  const [loading, setLoading] = useState(false);

  function onFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setLogoPreview(url);
  }

  const onFinish = async () => {
    // update local signup context first
    update({ companyLogo: logoPreview, companyDescription: description, linkedin });

    // build payload expected by backend: email, password, plus profile fields
    const payload = {
      email: data.email,
      password: data.password,
      role: 'employer',
      // profile fields (Profile model accepts fields like firstName/lastName/phone etc.)
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      // store some employer-specific fields inside profile where appropriate
      companyName: data.companyName,
      companyWebsite: data.companyWebsite,
      industry: data.industry,
      companySize: data.companySize,
      companyLocation: data.companyLocation,
      companyDescription: description,
      companyLogo: logoPreview,
      linkedin,
    };

    try {
      setLoading(true);
      const result = await signup(payload);

      // store returned profile/userId in signup context
      update({ ...result.profile, userId: result.userId });

      // attempt auto-login so client has a token and profile loaded
      try {
        const pw = data.password;
        if (pw) {
          await auth.login(data.email, pw);
        }
      } catch (e) {
        console.warn('Auto-login failed', e);
      }

      // navigate to employer dashboard
      navigate('/employer/dashboard');
    } catch (err) {
      console.error('Employer signup failed', err);
      alert(err?.message || 'Failed to finish signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup01-container">
      <div className="signup01-header">
        <SignupProgress currentStep={4} steps={["Account","Company","Owner","Profile"]} />
      </div>
      <h1 className="signup01-title">Complete your company profile</h1>
      <p className="small-note">This information will appear on your company's public page.</p>

      <div className="signup-card" style={{ marginTop: 12 }}>
        <label className="signup01-label">Company logo</label>
        <input type="file" accept="image/*" onChange={onFile} />
        {logoPreview && <div style={{ marginTop: 12 }}><strong>Preview:</strong><br /><img src={logoPreview} alt="logo preview" style={{ maxWidth: 160, marginTop: 8 }} /></div>}

        <div style={{ marginTop: 12 }}>
          <label className="signup01-label">Company description</label>
          <textarea className="signup01-input" value={description} onChange={e => setDescription(e.target.value)} rows={6} />
        </div>

        <div style={{ marginTop: 12 }}>
          <label className="signup01-label">LinkedIn / Website</label>
          <input className="signup01-input" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/company/your-company" />
        </div>

        <div className="form-actions">
          <button className="signup01-continue" onClick={onFinish} disabled={loading}>{loading ? 'Saving...' : 'Finish Setup & Go to Employer Dashboard'}</button>
        </div>
      </div>
    </div>
  );
}
