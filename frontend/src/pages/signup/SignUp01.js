import React from "react";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../contexts/SignupContext";
import "./SignUp01.css";

function SignUp01() {
  const { data, update } = useSignup();
  const navigate = useNavigate();

  const onChange = (e) => update({ [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    console.log("SignUp01 payload:", data);
    navigate("/signup-02");
  };

  return (
    <div className="signup01-container">
      <div className="signup01-header">
        <div>
          <button aria-label="back" onClick={() => navigate(-1)} style={{ border: 'none', background: 'transparent', fontSize: 20 }}>&larr;</button>
        </div>
        <div style={{ textAlign: "right" }}>Save And Exit</div>
      </div>

      <div className="signup01-progress" aria-hidden>
        <div className="bar" />
      </div>

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
            <label className="signup01-label">Phone Number*</label>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", padding: "8px 10px", border: "1px solid #eee", borderRadius: 6, background: "#fff" }}>
                <span style={{ marginRight: 6 }}>🇵🇹</span>
                <select style={{ border: "none", background: "transparent", outline: "none" }}>
                  <option>+351</option>
                </select>
              </div>
              <input className="signup01-input" name="phone" value={data.phone} onChange={onChange} placeholder="+351" style={{ flex: 1 }} />
            </div>
          </div>
        </div>

        <button className="signup01-continue" type="submit">Continue</button>
      </form>

      <img className="signup01-illustration" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><g fill='%23000' opacity='0.9'><circle cx='40' cy='180' r='6'/></g></svg>" alt="decorative illustration" />
    </div>
  );
}

export default SignUp01;
