import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupProgress from '../SignupProgress';
import { useSignup } from '../../../contexts/SignupContext';
import '../../signup/signup.css';

export default function SignUpE05() {
  const navigate = useNavigate();
  const { data, update, setCurrentStep } = useSignup();
  useEffect(() => setCurrentStep(5), [setCurrentStep]);

  const [logoPreview, setLogoPreview] = useState(data.companyLogo || '');
  const [description, setDescription] = useState(data.companyDescription || '');
  const [linkedin, setLinkedin] = useState(data.linkedin || '');

  function onFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setLogoPreview(url);
  }

  const onFinish = () => {
    // For now store the preview url as logo
    update({ companyLogo: logoPreview, companyDescription: description, linkedin });
    // navigate to employer dashboard after finishing company profile
    navigate('/employer/dashboard');
  };

  return (
    <div className="signup01-container">
  <SignupProgress currentStep={5} steps={["Account","Company","Owner","Verify","Profile"]} />
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

        <div style={{ marginTop: 18 }}>
          <button className="signup01-continue" onClick={() => navigate('/employer-signup-04')} style={{ marginRight: 8 }}>Back</button>
          <button className="signup01-continue" onClick={onFinish}>Finish Setup & Go to Employer Dashboard</button>
        </div>
      </div>
    </div>
  );
}
