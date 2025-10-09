import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupProgress from '../SignupProgress';
import { useSignup } from '../../../contexts/SignupContext';
import '../../signup/signup.css';
import CountrySelect from '../CountrySelect';

export default function SignUpE03() {
  const navigate = useNavigate();
  const { data, update, setCurrentStep } = useSignup();
  useEffect(() => setCurrentStep(3), [setCurrentStep]);

  const [fullName, setFullName] = useState(data.ownerName || '');
  const [position, setPosition] = useState(data.ownerPosition || '');
  const [phone, setPhone] = useState(data.ownerPhone || '');
  const [phoneCountry, setPhoneCountry] = useState(data.phoneCountry || '+63');
  const [email, setEmail] = useState(data.email || '');
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const fullNameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);

  const onNext = () => {
    setFullNameError(''); setEmailError('');
    if (!fullName) { setFullNameError('Please enter full name'); if (fullNameRef.current) { fullNameRef.current.focus(); fullNameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); } return; }
    if (!email) { setEmailError('Please enter a work email'); if (emailRef.current) { emailRef.current.focus(); emailRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); } return; }
    update({ ownerName: fullName, ownerPosition: position, ownerPhone: phone, email });
    navigate('/employer-signup-04');
  };

  return (
    <div className="signup01-container">
  <SignupProgress currentStep={3} steps={["Account","Company","Owner","Verify","Profile"]} />
      <h1 className="signup01-title">Owner / HR representative</h1>
      <p className="small-note">This person will manage hiring and job posts.</p>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Full name</label>
        <input ref={fullNameRef} className={`signup01-input ${fullNameError ? 'invalid-input' : ''}`} value={fullName} onChange={e => { setFullNameError(''); setFullName(e.target.value) }} />
        {fullNameError && <div className="signup-error">{fullNameError}</div>}
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Position / Role</label>
        <input className="signup01-input" value={position} onChange={e => setPosition(e.target.value)} placeholder="HR Manager, Owner" />
      </div>

      <div style={{ marginTop: 12 }} className="phone-row">
        <div className="phone-country">
          <CountrySelect value={phoneCountry} onChange={(code) => { setPhoneCountry(code); update({ phoneCountry: code }); }} />
        </div>
        <div style={{ flex: 1 }}>
          <label className="signup01-label">Phone number</label>
          <input className="signup01-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="555 555 5555" />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Work email</label>
        <input ref={emailRef} className={`signup01-input ${emailError ? 'invalid-input' : ''}`} value={email} onChange={e => { setEmailError(''); setEmail(e.target.value) }} />
        {emailError && <div className="signup-error">{emailError}</div>}
      </div>

      <div style={{ marginTop: 22 }}>
        <button className="signup01-continue" onClick={() => navigate('/employer-signup-02')} style={{ marginRight: 8 }}>Back</button>
        <button className="signup01-continue" onClick={onNext}>Next: Verification</button>
      </div>
    </div>
  );
}
