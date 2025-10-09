import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../../contexts/SignupContext";
import "../signup.css";
import SignupProgress from "../SignupProgress";
import { useEffect } from "react";
import CountrySelect from "../CountrySelect";
import { validatePhone } from "../../../utils/phone";

function SignUp02() {
  const navigate = useNavigate();
  const { data, update, setCurrentStep } = useSignup();
  useEffect(() => setCurrentStep(2), [setCurrentStep]);
  // keep local UI state only for validation messages
  const [phoneError, setPhoneError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  // refs to focus/scroll to invalid inputs
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const phoneRef = useRef(null);

  const onContinue = async () => {
    // validate first and last name
    setFirstNameError(''); setLastNameError('');
    if (!data.firstName || !data.lastName) {
      if (!data.firstName) setFirstNameError('Please enter your first name');
      if (!data.lastName) setLastNameError('Please enter your last name');
      // focus the first missing field
      if (!data.firstName && firstNameRef.current) {
        firstNameRef.current.focus();
        firstNameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (!data.lastName && lastNameRef.current) {
        lastNameRef.current.focus();
        lastNameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    // validate phone if present
    const country = data.phoneCountry || '+63';
    const result = await validatePhone(country, data.phone || '');
    if (!result.valid) {
      setPhoneError('Invalid phone number for the selected country');
      if (phoneRef.current) {
        phoneRef.current.focus();
        phoneRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    update({ phone: result.e164 });
    navigate('/signup-03');
  };

  return (
    <div className="signup01-container">
      <SignupProgress currentStep={2} />
      <h1 className="signup01-title">Profile details</h1>
      <p>Current role: <strong>{data.role}</strong></p>

      <div className="signup01-grid" style={{ gap: 24 }}>
        <div>
          <div className="two-cols">
            <div>
              <label className="signup01-label">First name</label>
              <input ref={firstNameRef} className={`signup01-input ${firstNameError ? 'invalid-input' : ''}`} name="firstName" value={data.firstName || ''} onChange={e => { setFirstNameError(''); update({ firstName: e.target.value }) }} />
              {firstNameError && <div className="signup-error">{firstNameError}</div>}
            </div>
            <div>
              <label className="signup01-label">Last name</label>
              <input ref={lastNameRef} className={`signup01-input ${lastNameError ? 'invalid-input' : ''}`} name="lastName" value={data.lastName || ''} onChange={e => { setLastNameError(''); update({ lastName: e.target.value }) }} />
              {lastNameError && <div className="signup-error">{lastNameError}</div>}
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label className="signup01-label">Date of birth (optional)</label>
            <br />
            <input type="date" name="dateOfBirth" value={data.dateOfBirth || ''} onChange={e => update({ dateOfBirth: e.target.value })} />
          </div>

          <div style={{ marginTop: 12 }}>
            <label className="signup01-label">Address (single line, optional)</label>
            <br />
            <input className="signup01-input" name="addressLine" value={data.addressLine || ''} onChange={e => update({ addressLine: e.target.value })} placeholder="Street address, building, apt, etc. (one line)" />
          </div>

          <div style={{ marginTop: 12 }}>
            <label className="signup01-label">City / Municipality</label>
              <br />
              <input className="signup01-input" name="city" value={data.city || ''} onChange={e => update({ city: e.target.value })} placeholder="City / Municipality" />
          </div>

          
        </div>

        <div>
          

          <div style={{ marginTop: 12 }}>
            <label className="signup01-label">State / Province</label>
              <br />
              <input className="signup01-input" name="stateprovince" value={data.stateprovince || ''} onChange={e => update({ stateprovince: e.target.value })} placeholder="State / Province" />
          </div>

          <div style={{ marginTop: 12 }}>
            <label className="signup01-label">Gender (optional)</label>
              <br />
              <select className="signup01-input" name="gender" value={data.gender || ''} onChange={e => update({ gender: e.target.value })}>
                <option value="">Prefer not to say</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
          </div>
          <div style={{ marginTop: 12 }}>
            <label className="signup01-label">Postal Code</label>
              <br />
              <input className="signup01-input" name="postalCode" value={data.postalCode || ''} onChange={e => update({ postalCode: e.target.value })} placeholder="Postal / ZIP code" />
          </div>

          <div style={{ marginTop: 12 }}>
            <label className="signup01-label">Country</label>
              <br />
              {/* when user selects a country for address, also sync the phone country; hide dialing code for address selector */}
              <CountrySelect showCode={false} value={data.country || data.phoneCountry || '+63'} onChange={(code) => update({ country: code, phoneCountry: code })} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Phone Number*</label>
        <div style={{ display: "flex", gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* when user changes phone country, keep address country in sync */}
            <CountrySelect value={data.phoneCountry || '+63'} onChange={(code) => update({ phoneCountry: code, country: code })} />
          </div>
          <input ref={phoneRef} className={`signup01-input ${phoneError ? 'invalid-input' : ''}`} name="phone" value={data.phone || ''} onChange={e => { setPhoneError(''); update({ phone: e.target.value }) }} placeholder="712345678" style={{ flex: 1 }} />
        </div>
        {phoneError && <div className="signup-error">{phoneError}</div>}
      </div>

      <div style={{ marginTop: 18 }}>
        <button className="signup01-continue" onClick={() => navigate('/signup-01')} style={{ marginRight: 8 }}>Back</button>
        <button className="signup01-continue" onClick={onContinue}>Continue</button>
      </div>
    </div>
  );
}

export default SignUp02;
