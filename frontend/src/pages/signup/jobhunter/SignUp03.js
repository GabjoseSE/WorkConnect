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
  // student fields
  const [isStudent, setIsStudent] = useState(data.isStudent || false);
  const [schoolName, setSchoolName] = useState(data.schoolName || '');
  const [program, setProgram] = useState(data.program || '');
  const [yearLevel, setYearLevel] = useState(data.yearLevel || '');
  const [expectedGraduationDate, setExpectedGraduationDate] = useState(data.expectedGraduationDate || '');
  const [studentId, setStudentId] = useState(data.studentId || '');
  // job preferences for students
  const [prefJobType, setPrefJobType] = useState(data.jobType || 'internship');
  const [prefField, setPrefField] = useState(data.prefField || '');
  const [prefHours, setPrefHours] = useState(data.prefHours || '');
  const [prefLocation, setPrefLocation] = useState(data.prefLocation || 'remote');

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
        update({ headline, experienceYears, skills: skillsArr, resumeUrl, education, desiredPosition, workSetup, expectedSalary,
          isStudent, schoolName, program, yearLevel, expectedGraduationDate, studentId,
          jobType: prefJobType, prefField, prefHours, prefLocation
        });
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
      <div className="signup01-header">
        <button className="signup-back-icon" onClick={() => navigate('/signup-02')} aria-label="Go back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M15 18L9 12L15 6" stroke="#233038" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <SignupProgress currentStep={3} />
      </div>
      <h1 className="signup01-title">Professional details</h1>

      {/* top: ask if user is a student */}
      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Are you a student?</label>
        <div>
          <label style={{ marginRight: 12 }}>
            <input type="checkbox" checked={isStudent} onChange={e => setIsStudent(e.target.checked)} />{' '}
            Yes, I'm a student
          </label>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Professional headline</label>
        <input
          className="signup01-input"
          value={headline}
          onChange={e => setHeadline(e.target.value)}
          placeholder={isStudent ? "e.g. Student Intern, IT Student, Computer Science Student, Aspiring Frontend Developer" : "e.g. Frontend Developer"}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Years of experience</label>
        <select className="signup01-input" value={experienceYears} onChange={e => setExperienceYears(e.target.value)}>
          <option value="">Select</option>
          {isStudent ? (
            <>
              <option value="0-1">0–1 year</option>
              <option value="internship">Internship / Academic Projects</option>
            </>
          ) : (
            <>
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5+">5+</option>
            </>
          )}
        </select>
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Key skills (comma separated)</label>
        <input className="signup01-input" value={skills} onChange={e => setSkills(e.target.value)} placeholder={isStudent ? "e.g. HTML, CSS, JavaScript, Python, Database Management" : "e.g. React, Node.js, CSS"} />
        <div className="skill-chips">
          {(skills.split(',').map(s => s.trim()).filter(Boolean)).map((s, i) => (
            <div className="skill-chip" key={i}>{s}</div>
          ))}
        </div>
      </div>

  <div style={{ marginTop: 12 }}>
    <label className="signup01-label">Upload Resume (PDF or DOCX)</label>
    <input type="file" accept=".pdf,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={e => setResumeFile(e.target.files[0])} />
    <div className="resume-note">{isStudent ? 'Optional — you may upload a Student CV / Academic Resume' : ''}</div>
  {resumeFile && <div className="resume-note">Selected: {resumeFile.name}</div>}
  {!resumeFile && data.resumeUrl && <div className="resume-note">Existing resume: <a href={data.resumeUrl} target="_blank" rel="noreferrer">View</a></div>}
  {uploading && <div className="uploading">Uploading resume…</div>}
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Education Level</label>
        <select className="signup01-input" value={education} onChange={e => setEducation(e.target.value)}>
          <option value="">Select</option>
          {isStudent ? (
            <>
              <option value="college">College Student</option>
              <option value="senior-high">Senior High Student</option>
              <option value="graduate">Graduate</option>
            </>
          ) : (
            <>
              <option value="highschool">High School</option>
              <option value="bachelors">Bachelor's</option>
              <option value="masters">Master's</option>
              <option value="phd">PhD</option>
            </>
          )}
        </select>
      </div>

      {/* student checkbox lives in the conditional student section */}

      {isStudent && (
        <div style={{ marginTop: 12 }}>
          <h3 style={{ marginBottom: 8 }}>Academic Information</h3>
          <div>
            <label className="signup01-label">School / University name</label>
            <input className="signup01-input" value={schoolName} onChange={e => setSchoolName(e.target.value)} />
          </div>
          <div style={{ marginTop: 12 }}>
            <label className="signup01-label">Program or course</label>
            <input className="signup01-input" value={program} onChange={e => setProgram(e.target.value)} placeholder="e.g. BS Information Technology" />
          </div>
          <div style={{ marginTop: 12 }}>
            <label className="signup01-label">Year level</label>
            <input className="signup01-input" value={yearLevel} onChange={e => setYearLevel(e.target.value)} placeholder="e.g. 3rd Year, 1st Semester" />
          </div>
          <div style={{ marginTop: 12 }}>
            <label className="signup01-label">Expected graduation date</label>
            <input className="signup01-input" type="date" value={expectedGraduationDate} onChange={e => setExpectedGraduationDate(e.target.value)} />
          </div>
          <div style={{ marginTop: 12 }}>
            <label className="signup01-label">Student ID (optional)</label>
            <input className="signup01-input" value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="Student ID" />
          </div>

          <h3 style={{ marginTop: 18 }}>Job Preferences</h3>
          <div>
            <label className="signup01-label">Desired job type</label>
            <select className="signup01-input" value={prefJobType} onChange={e => setPrefJobType(e.target.value)}>
              <option value="internship">Internship</option>
              <option value="part-time">Part-time</option>
              <option value="freelance">Freelance</option>
              <option value="full-time">Full-time</option>
            </select>
          </div>
          <div style={{ marginTop: 12 }}>
            <label className="signup01-label">Preferred field or industry</label>
            <input className="signup01-input" value={prefField} onChange={e => setPrefField(e.target.value)} placeholder="e.g. Software, Design" />
          </div>
          <div style={{ marginTop: 12 }}>
            <label className="signup01-label">Expected work hours / schedule</label>
            <input className="signup01-input" value={prefHours} onChange={e => setPrefHours(e.target.value)} placeholder="e.g. Evenings, Weekends" />
          </div>
          <div style={{ marginTop: 12 }}>
            <label className="signup01-label">Location preference</label>
            <select className="signup01-input" value={prefLocation} onChange={e => setPrefLocation(e.target.value)}>
              <option value="onsite">On-site</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Desired position / title</label>
        <input className="signup01-input" value={desiredPosition} onChange={e => setDesiredPosition(e.target.value)} placeholder={isStudent ? "e.g. Intern, On-the-Job Trainee, Entry-Level Developer" : "e.g. Senior Frontend Engineer"} />
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">Work setup</label>
        <select className="signup01-input" value={workSetup} onChange={e => setWorkSetup(e.target.value)}>
          <option value="">Select</option>
          {isStudent ? (
            <>
              <option value="intern-onsite">Internship (Onsite)</option>
              <option value="intern-hybrid">Internship (Hybrid)</option>
              <option value="intern-remote">Internship (Remote)</option>
            </>
          ) : (
            <>
              <option value="onsite">On-site</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
            </>
          )}
        </select>
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="signup01-label">{isStudent ? 'Allowance (optional)' : 'Expected salary (optional)'}</label>
        <input className="signup01-input" value={expectedSalary} onChange={e => setExpectedSalary(e.target.value)} placeholder={isStudent ? 'e.g. 2000 (monthly allowance)' : 'e.g. 40000'} />
      </div>

      <div className="form-actions">
        <button className="signup01-continue" onClick={onNext} disabled={uploading}>{uploading ? 'Uploading…' : 'Next'}</button>
      </div>
    </div>
  );
}

export default SignUp03;
