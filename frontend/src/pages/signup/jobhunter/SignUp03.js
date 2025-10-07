import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../../contexts/SignupContext";
import "../signup.css";
import SignupProgress from "../SignupProgress";
import { useEffect } from "react";
import { uploadFile } from '../../../api/upload';

function SignUp03() {
  const navigate = useNavigate();
  const { data, update, setCurrentStep } = useSignup();
  useEffect(() => setCurrentStep(3), [setCurrentStep]);
  const [headline, setHeadline] = useState(data.headline || '');
  const [experienceYears, setExperienceYears] = useState(data.experienceYears || '');
  const [skills, setSkills] = useState((data.skills || []).join(', '));
  const [resumeFile, setResumeFile] = useState(null);
  const [education, setEducation] = useState(data.education || '');
  const [desiredPosition, setDesiredPosition] = useState(data.desiredPosition || '');
  const [workSetup, setWorkSetup] = useState(data.workSetup || '');
  const [expectedSalary, setExpectedSalary] = useState(data.expectedSalary || '');

  const onNext = () => {
    (async () => {
      try {
        const skillsArr = skills.split(',').map(s => s.trim()).filter(Boolean);
        let resumeUrl = data.resumeUrl;
        if (resumeFile) {
          setUploading(true);
          const r = await uploadFile(resumeFile);
          resumeUrl = r.url;
          setUploading(false);
        }
        update({ headline, experienceYears, skills: skillsArr, resumeUrl, education, desiredPosition, workSetup, expectedSalary });
        navigate('/signup-04');
      } catch (err) {
        setUploading(false);
        alert('Failed to upload resume: ' + (err.message || err));
      }
    })();
  };

  const [uploading, setUploading] = useState(false);

  return (
    <div className="signup01-container">
      <SignupProgress currentStep={3} />
      <h1 className="signup01-title">Professional details</h1>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Professional headline</label>
        <br />
        <input className="signup01-input" value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g. Frontend Developer" />
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Years of experience</label>
        <br />
        <select className="signup01-input" value={experienceYears} onChange={e => setExperienceYears(e.target.value)}>
          <option value="">Select</option>
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5+">5+</option>
        </select>
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Key skills (comma separated)</label>
        <br />
        <input className="signup01-input" value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g. React, Node.js, CSS" />
        <div className="skill-chips">
          {(skills.split(',').map(s => s.trim()).filter(Boolean)).map((s, i) => (
            <div className="skill-chip" key={i}>{s}</div>
          ))}
        </div>
      </div>

  <div style={{ marginTop: 12 }}>
    <label className="signup01-label">Upload Resume (PDF or DOCX)</label>
    <br />
  <input type="file" accept=".pdf,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={e => setResumeFile(e.target.files[0])} />
  {resumeFile && <div className="resume-note">Selected: {resumeFile.name}</div>}
  {!resumeFile && data.resumeUrl && <div className="resume-note">Existing resume: <a href={data.resumeUrl} target="_blank" rel="noreferrer">View</a></div>}
  {uploading && <div className="uploading">Uploading resume…</div>}
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Education Level</label>
        <br />
        <select className="signup01-input" value={education} onChange={e => setEducation(e.target.value)}>
          <option value="">Select</option>
          <option value="highschool">High School</option>
          <option value="bachelors">Bachelor's</option>
          <option value="masters">Master's</option>
          <option value="phd">PhD</option>
        </select>
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Desired position / title</label>
        <br />
        <input className="signup01-input" value={desiredPosition} onChange={e => setDesiredPosition(e.target.value)} placeholder="e.g. Senior Frontend Engineer" />
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Work setup</label>
        <br />
        <select className="signup01-input" value={workSetup} onChange={e => setWorkSetup(e.target.value)}>
          <option value="">Select</option>
          <option value="onsite">On-site</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Expected salary (optional)</label>
        <br />
        <input className="signup01-input" value={expectedSalary} onChange={e => setExpectedSalary(e.target.value)} placeholder="e.g. 40000" />
      </div>

      <div style={{ marginTop: 18 }}>
        <button className="signup01-continue" onClick={() => navigate('/signup-02')} style={{ marginRight: 8 }}>Back</button>
        <button className="signup01-continue" onClick={onNext} disabled={uploading}>{uploading ? 'Uploading…' : 'Next'}</button>
      </div>
    </div>
  );
}

export default SignUp03;
