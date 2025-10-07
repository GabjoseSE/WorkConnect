import React, { useEffect, useState } from 'react';
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

  const onNext = () => {
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
        <input className="signup01-input" value={fullName} onChange={e => setFullName(e.target.value)} />
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
        <input className="signup01-input" value={email} onChange={e => setEmail(e.target.value)} />
      </div>

      <div style={{ marginTop: 22 }}>
        <button className="signup01-continue" onClick={() => navigate('/employer-signup-02')} style={{ marginRight: 8 }}>Back</button>
        <button className="signup01-continue" onClick={onNext}>Next: Verification</button>
      </div>
    </div>
  );
}
