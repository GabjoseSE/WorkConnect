import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './profile.css';

export default function Profile() {
  const { profile } = useAuth(); // profile picture and basic info from auth
  const navigate = useNavigate();

  // lightweight local state for UI-only interactions (uploads, edits)
  const [completeness, setCompleteness] = useState(82);
  const [activities, setActivities] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);
  const [avatarEditing, setAvatarEditing] = useState(false);

  // fallback profile when auth profile not present
  const user = profile || {
    firstName: 'Philip',
    lastName: 'Maya',
    role: 'UI/UX Designer',
    location: 'Porto, Portugal',
    image: 'https://ui-avatars.com/api/?name=Philip+Maya&background=E0E7FF&color=1D4ED8',
    email: 'philip@example.com',
    phone: '+351 912 345 678'
  };

  useEffect(() => {
    // keep previous behavior but with safer fallbacks
    fetch('/api/profile/completeness')
      .then((r) => r.json())
      .then((d) => { if (d && typeof d.percentage === 'number') setCompleteness(d.percentage); })
      .catch(() => {/* ignore - keep fallback */});

    fetch('/api/profile/activities')
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setActivities(d); })
      .catch(() => {
        setActivities([
          { company: 'Meta Company', position: 'Product Designer', location: 'Porto, Portugal (On-site)', archivedAt: '5 days ago' },
          { company: 'Google', position: 'UX Researcher', location: 'Lisbon, Portugal (Hybrid)', archivedAt: '1 week ago' }
        ]);
      });
  }, []);

  const handleSettingsClick = () => navigate('/settings');

  const handleResumeChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) setResumeFile(f);
  };

  const handleAvatarEdit = () => {
    setAvatarEditing(true);
    // UI-only for now; wire to upload flow when backend ready
    setTimeout(() => setAvatarEditing(false), 1500);
  };

  // small wrapper to render an input (or textarea/select) with a right-side edit icon
  function InputWrap({ children }) {
    const [editing, setEditing] = useState(false);
    const ref = React.useRef(null);

    React.useEffect(() => {
      if (editing && ref.current && typeof ref.current.focus === 'function') {
        try { ref.current.focus(); } catch (e) { /* ignore */ }
      }
    }, [editing]);

    // detect if child is a select (hide edit icon on dropdowns)
    const child = React.Children.only(children);
    const isSelect = React.isValidElement(child) && (child.type === 'select' || child.props?.type === 'select');

    const cloned = React.isValidElement(child)
      ? React.cloneElement(child, { ref, readOnly: isSelect ? false : !editing })
      : child;

    return (
      <div className="input-wrap">
        {cloned}
        {!isSelect && (
          <>
            {!editing ? (
              <button type="button" className="field-edit" onClick={() => setEditing(true)} aria-label="Edit field">✏️</button>
            ) : (
              <button type="button" className="field-done" onClick={() => setEditing(false)} aria-label="Done">✓</button>
            )}
          </>
        )}
      </div>
    );
  }

  // lists: languages, skills, portfolio links, certifications
  const [languagesList, setLanguagesList] = useState(['English (Fluent)']);
  const [newLanguage, setNewLanguage] = useState('');

  const [skillsList, setSkillsList] = useState(['UI Design']);
  const [newSkill, setNewSkill] = useState('');

  const [portfolioList, setPortfolioList] = useState([]);
  const [newPortfolio, setNewPortfolio] = useState('');

  const [certsList, setCertsList] = useState([]);
  const [newCert, setNewCert] = useState('');

  function addIfNotEmpty(value, setter, clearSetter) {
    if (!value || !value.trim()) return;
    setter(prev => [...prev, value.trim()]);
    clearSetter('');
  }

  function removeAt(index, setter) {
    setter(prev => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="profile-page">
      <div className="profile-center">
        <header className="profile-top">
          <div className="profile-top-left">
            <div className="profile-avatar large">
              <img src={user.image} alt={`${user.firstName} ${user.lastName}`} />
              <button className="edit-avatar-btn" onClick={handleAvatarEdit} aria-label="Edit avatar">✏️</button>
            </div>
            <div className="profile-meta">
              <h1 className="profile-name">{user.firstName} {user.lastName}</h1>
              <p className="profile-role">{user.role}</p>
              <p className="profile-contact">{user.email} · {user.phone}</p>
              <p className="profile-location">{user.location}</p>
            </div>
          </div>
          <div className="profile-top-right">
            <button className="settings-btn" onClick={handleSettingsClick}>Settings</button>
          </div>
        </header>

        <div className="profile-grid">
          <main className="profile-main">
            <section className="card">
              <div className="card-body">
                <h3>Basic Information</h3>
                <div className="form-row">
                  <label>Full Name</label>
                  <InputWrap>
                    <input defaultValue={`${user.firstName} ${user.lastName}`} />
                  </InputWrap>
                </div>
                {/* Job Title / Role removed as requested */}
                <div className="form-row two-col">
                  <div>
                    <label>Contact (Email)</label>
                    <InputWrap>
                      <input defaultValue={user.email} />
                    </InputWrap>
                  </div>
                  <div>
                    <label>Phone</label>
                    <InputWrap>
                      <input defaultValue={user.phone} />
                    </InputWrap>
                  </div>
                </div>
                <div className="form-row two-col">
                  <div>
                    <label>City</label>
                    <InputWrap>
                      <input defaultValue={(user.location || '').split(',')[0]} />
                    </InputWrap>
                  </div>
                  <div>
                    <label>Province / State</label>
                    <InputWrap>
                      <input />
                    </InputWrap>
                  </div>
                </div>
                <div className="form-row">
                  <label>About / Bio</label>
                  <InputWrap>
                    <textarea placeholder="Tell employers about yourself, your career goals and strengths." rows={5} />
                  </InputWrap>
                </div>
              </div>
            </section>

            <section className="card">
              <div className="card-body">
                <h3>Professional Information</h3>

                <div className="form-row">
                  <label>Skills</label>
                  <div className="list-input">
                    <div className="chips">
                      {skillsList.map((s, i) => (
                        <span className="chip" key={i}>{s}<button onClick={() => removeAt(i, setSkillsList)} className="chip-remove" aria-label={`Remove ${s}`}>×</button></span>
                      ))}
                    </div>
                    <div className="add-row">
                      <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Add skill" />
                      <button type="button" className="add-btn" onClick={() => addIfNotEmpty(newSkill, setSkillsList, setNewSkill)}>+</button>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <label>Experience</label>
                  <div className="experience-item">
                    <InputWrap><input placeholder="Company" /></InputWrap>
                    <InputWrap><input placeholder="Position" /></InputWrap>
                    <InputWrap><input placeholder="Duration (e.g. 2019 - 2021)" /></InputWrap>
                    <InputWrap><textarea placeholder="Short description" rows={3}></textarea></InputWrap>
                  </div>
                </div>

                <div className="form-row two-col">
                  <div>
                    <label>Education</label>
                    <InputWrap><input placeholder="School, Course, Year" /></InputWrap>
                  </div>
                  <div>
                    <label>Certifications / Training</label>
                    <div className="list-input">
                      <div className="chips">
                        {certsList.map((c, i) => (
                          <span className="chip" key={i}>{c}<button onClick={() => removeAt(i, setCertsList)} className="chip-remove" aria-label={`Remove ${c}`}>×</button></span>
                        ))}
                      </div>
                      <div className="add-row">
                        <input value={newCert} onChange={(e) => setNewCert(e.target.value)} placeholder="Add certification" />
                        <button type="button" className="add-btn" onClick={() => addIfNotEmpty(newCert, setCertsList, setNewCert)}>+</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>

          <aside className="profile-side">
            <section className="card">
              <div className="card-body">
                <h3>Personal Details</h3>
                <div className="form-row two-col">
                  <div>
                    <label>Gender</label>
                    <InputWrap>
                      <select>
                        <option>Prefer not to say</option>
                        <option>Female</option>
                        <option>Male</option>
                        <option>Other</option>
                      </select>
                    </InputWrap>
                  </div>
                  <div>
                    <label>Date of Birth</label>
                    <InputWrap>
                      <input type="date" />
                    </InputWrap>
                  </div>
                </div>
                <div className="form-row">
                  <label>Nationality</label>
                  <InputWrap><input /></InputWrap>
                </div>
                <div className="form-row">
                  <label>Languages</label>
                  <div className="list-input">
                    <div className="chips">
                      {languagesList.map((l, i) => (
                        <span className="chip" key={i}>{l}<button onClick={() => removeAt(i, setLanguagesList)} className="chip-remove" aria-label={`Remove ${l}`}>×</button></span>
                      ))}
                    </div>
                    <div className="add-row">
                      <input value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)} placeholder="Add language" />
                      <button type="button" className="add-btn" onClick={() => addIfNotEmpty(newLanguage, setLanguagesList, setNewLanguage)}>+</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="card">
              <div className="card-body">
                <h3>Documents</h3>
                <div className="form-row">
                  <label>Resume / CV</label>
                  <div className="file-upload">
                    <input id="resumeUpload" type="file" onChange={handleResumeChange} />
                    <label htmlFor="resumeUpload" className="upload-cta">{resumeFile ? resumeFile.name : 'Upload your resume'}</label>
                  </div>
                </div>
                <div className="form-row">
                  <label>Portfolio Links</label>
                  <div className="list-input">
                    <div className="chips">
                      {portfolioList.map((p, i) => (
                        <span className="chip" key={i}><a href={p} target="_blank" rel="noreferrer">{p}</a><button onClick={() => removeAt(i, setPortfolioList)} className="chip-remove" aria-label={`Remove ${p}`}>×</button></span>
                      ))}
                    </div>
                    <div className="add-row">
                      <input value={newPortfolio} onChange={(e) => setNewPortfolio(e.target.value)} placeholder="Add portfolio URL" />
                      <button type="button" className="add-btn" onClick={() => addIfNotEmpty(newPortfolio, setPortfolioList, setNewPortfolio)}>+</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="card">
              <div className="card-body">
                <h3>Preferences</h3>
                <div className="form-row">
                  <label>Desired Job Type</label>
                  <InputWrap>
                    <select>
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Internship</option>
                      <option>Contract</option>
                    </select>
                  </InputWrap>
                </div>
                <div className="form-row">
                  <label>Work Arrangement</label>
                  <InputWrap>
                    <select>
                      <option>On-site</option>
                      <option>Remote</option>
                      <option>Hybrid</option>
                    </select>
                  </InputWrap>
                </div>
                <div className="form-row">
                  <label>Expected Salary (optional)</label>
                  <InputWrap><input placeholder="e.g. 30,000 - 45,000 EUR" /></InputWrap>
                </div>
              </div>
            </section>

            <section className="card">
              <div className="card-body">
                <h3>Account</h3>
                <div className="form-row">
                  <button className="secondary">Change Password</button>
                </div>
                <div className="form-row">
                  <button className="secondary">Manage Privacy Settings</button>
                </div>
                <div className="form-row">
                  <button className="danger">Deactivate / Delete Account</button>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
