import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupProgress from '../SignupProgress';
import { useSignup } from '../../../contexts/SignupContext';
import '../../signup/signup.css';

const industries = ['Technology','Finance','Healthcare','Education','Retail','Other'];
const sizes = ['1-10','11-50','51-200','201-500','501-1000','1000+'];

export default function SignUpE02() {
  const navigate = useNavigate();
  const { data, update, setCurrentStep } = useSignup();
  useEffect(() => setCurrentStep(2), [setCurrentStep]);

  const [companyName, setCompanyName] = useState(data.companyName || '');
  const [website, setWebsite] = useState(data.companyWebsite || '');
  const [industry, setIndustry] = useState(data.industry || '');
  const [size, setSize] = useState(data.companySize || '');
  const [location, setLocation] = useState(data.companyLocation || '');
  const [companyError, setCompanyError] = useState('');
  const [locationError, setLocationError] = useState('');
  const companyRef = useRef(null);
  const locationRef = useRef(null);

  const onNext = () => {
    setCompanyError(''); setLocationError('');
    if (!companyName) { setCompanyError('Please enter your company name'); if (companyRef.current) { companyRef.current.focus(); companyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); } return; }
    if (!location) { setLocationError('Please enter company location'); if (locationRef.current) { locationRef.current.focus(); locationRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); } return; }
    update({ companyName, companyWebsite: website, industry, companySize: size, companyLocation: location });
    navigate('/employer-signup-03');
  };

  return (
    <div className="signup01-container">
  <SignupProgress currentStep={2} steps={["Account","Company","Owner","Verify","Profile"]} />
      <h1 className="signup01-title">Company details</h1>
      <p className="small-note">Tell us about your company so candidates can learn more.</p>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Company name</label>
        <input ref={companyRef} className={`signup01-input ${companyError ? 'invalid-input' : ''}`} value={companyName} onChange={e => { setCompanyError(''); setCompanyName(e.target.value) }} />
        {companyError && <div className="signup-error">{companyError}</div>}
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Company website</label>
        <input className="signup01-input" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://" />
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Industry</label>
        <select className="signup01-input" value={industry} onChange={e => setIndustry(e.target.value)}>
          <option value="">Select industry</option>
          {industries.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Company size</label>
        <select className="signup01-input" value={size} onChange={e => setSize(e.target.value)}>
          <option value="">Select size</option>
          {sizes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Company location (city, country)</label>
        <input ref={locationRef} className={`signup01-input ${locationError ? 'invalid-input' : ''}`} value={location} onChange={e => { setLocationError(''); setLocation(e.target.value) }} placeholder="City, Country" />
        {locationError && <div className="signup-error">{locationError}</div>}
      </div>

      <div style={{ marginTop: 22 }}>
        <button className="signup01-continue" onClick={() => navigate('/employer-signup-01')} style={{ marginRight: 8 }}>Back</button>
        <button className="signup01-continue" onClick={onNext}>Next: HR / Owner Info</button>
      </div>
    </div>
  );
}
