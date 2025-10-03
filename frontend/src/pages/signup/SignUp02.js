import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../contexts/SignupContext";
import { saveProfile } from "../../api/profile";

function SignUp02() {
  const navigate = useNavigate();
  const { data, update } = useSignup();
  const [skills, setSkills] = useState((data.skills || []).join(', '));
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const onContinue = async () => {
    const skillsArr = skills.split(',').map(s => s.trim()).filter(Boolean);
    update({ skills: skillsArr });

    // simple upload: we won't implement full file upload to S3 here.
    // For now, if a file is provided, we'll set a placeholder resumeUrl and still save the profile.
    const payload = { ...data, skills: skillsArr };
    if (resumeFile) {
      payload.resumeUrl = `/uploads/${resumeFile.name}`; // placeholder
    }

    try {
      setLoading(true);
      await saveProfile(payload);
      navigate('/signup-03');
    } catch (err) {
      console.error(err);
      alert('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Sign Up - Profile Details</h2>
      <p>Current role: <strong>{data.role}</strong></p>

      <div style={{ marginTop: 12 }}>
        <label>Skills (comma separated)</label>
        <br />
        <input style={{ width: 400 }} value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g. React, Node.js, CSS" />
      </div>

      <div style={{ marginTop: 12 }}>
        <label>Upload Resume (PDF)</label>
        <br />
        <input type="file" accept="application/pdf" onChange={e => setResumeFile(e.target.files[0])} />
      </div>

      <div style={{ marginTop: 18 }}>
        <button onClick={() => navigate('/signup-01')} style={{ marginRight: 8 }}>Back</button>
        <button onClick={onContinue} disabled={loading}>{loading ? 'Saving...' : 'Continue'}</button>
      </div>
    </div>
  );
}

export default SignUp02;
