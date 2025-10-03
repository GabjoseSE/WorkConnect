import React from "react";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../contexts/SignupContext";
import "./signup.css";
import SignupProgress from "./SignupProgress";
import CountrySelect from "./CountrySelect";
import { useEffect, useState } from "react";
import { validatePhone } from "../../utils/phone";

function SignUp01() {
  const { data, update, setCurrentStep } = useSignup();
  const navigate = useNavigate();

  const onChange = (e) => update({ [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    // validate phone
    const country = data.phoneCountry || '+63';
    const result = await validatePhone(country, data.phone || '');
    if (!result.valid) {
      setPhoneError('Invalid phone number for the selected country');
      return;
    }

    // save normalized phone in context and continue
    update({ phone: result.e164 });
    navigate("/signup-02");
  };

  const [phoneError, setPhoneError] = useState('');

  useEffect(() => setCurrentStep(1), [setCurrentStep]);

  return (
    <div className="signup01-container">
      <div className="signup01-header">
        <div>
          <button aria-label="back" onClick={() => navigate(-1)} style={{ border: 'none', background: 'transparent', fontSize: 20 }}>&larr;</button>
        </div>
        <div style={{ textAlign: "right" }}>Save And Exit</div>
      </div>

      <SignupProgress currentStep={1} />

      <h1 className="signup01-title">Give Us Your Primary Information</h1>

      <div style={{ marginBottom: 12 }}>
        <label style={{ marginRight: 12 }}>
          <input type="radio" name="role" value="jobhunter" checked={data.role === 'jobhunter'} onChange={(e) => update({ role: e.target.value })} /> Job Hunter / Employee
        </label>
        <label>
          <input type="radio" name="role" value="employer" checked={data.role === 'employer'} onChange={(e) => update({ role: e.target.value })} /> Employer
        </label>
      </div>

      <form onSubmit={onSubmit}>
        <div className="signup01-grid">
          <div>
            <label className="signup01-label">Name</label>
            <input className="signup01-input" name="firstName" value={data.firstName} onChange={onChange} placeholder="Write Your Name" />
          </div>

          <div>
            <label className="signup01-label">Last Name</label>
            <input className="signup01-input" name="lastName" value={data.lastName} onChange={onChange} placeholder="Write Your Last Name" />
          </div>

          <div>
            <label className="signup01-label">Email*</label>
            <input className="signup01-input" name="email" value={data.email} onChange={onChange} placeholder="" />
          </div>

          <div>
            <label className="signup01-label">Password*</label>
            <input className="signup01-input" name="password" value={data.password} onChange={onChange} type="password" placeholder="Create a password" />
          </div>
        </div>

        <div className="signup01-grid" style={{ marginTop: 12 }}>
          <div>
            <label className="signup01-label">Phone Number*</label>
            <div style={{ display: "flex", gap: 8 }}>
              <div className={phoneError ? 'invalid-box' : ''} style={{ display: "flex", alignItems: "center", padding: "8px 10px", border: "1px solid #eee", borderRadius: 6, background: "#fff" }}>
                {/* CountrySelect replaces the plain select - keeps flags and code */}
                <div style={{ width: 320 }}>
                  <CountrySelect value={data.phoneCountry || '+63'} onChange={(code) => { setPhoneError(''); update({ phoneCountry: code }); }} />
                </div>
              </div>
              <input className={`signup01-input ${phoneError ? 'invalid-input' : ''}`} name="phone" value={data.phone} onChange={(e) => { setPhoneError(''); onChange(e); }} placeholder="712345678" style={{ flex: 1 }} />
            </div>
            {phoneError && <div className="signup-error">{phoneError}</div>}
          </div>
        </div>

        <button className="signup01-continue" type="submit">Continue</button>
      </form>

      <img className="signup01-illustration" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><g fill='%23000' opacity='0.9'><circle cx='40' cy='180' r='6'/></g></svg>" alt="decorative illustration" />
    </div>
  );
}

export default SignUp01;
