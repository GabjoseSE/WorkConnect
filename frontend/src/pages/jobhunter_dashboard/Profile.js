import React, { useState, useEffect, useRef } from 'react';
import { saveProfile } from '../../api/profile';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './profile.css';

export default function Profile() {
  const { profile, token, setProfile } = useAuth(); // profile picture and basic info from auth
  const navigate = useNavigate();

  // editing state per section
  const [editingBasic, setEditingBasic] = useState(false);
  const [editingEducation, setEditingEducation] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState(false);
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingDocuments, setEditingDocuments] = useState(false);
  const [editingPreferences, setEditingPreferences] = useState(false);

  // lightweight local state for UI-only interactions (uploads, edits)
  const [completeness, setCompleteness] = useState(82);
  const [activities, setActivities] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);
  const [avatarEditing, setAvatarEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const avatarInputRef = useRef(null);

  // Use profile from auth when available; otherwise use safe empty defaults
  const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=E0E7FF&color=1D4ED8';
  const user = profile || {
    firstName: '',
    lastName: '',
    role: '',
    location: '',
    image: defaultAvatar,
    email: '',
    phone: ''
  };

  // Controlled fields for main profile inputs
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [emailState, setEmailState] = useState(user.email || '');
  const [phoneState, setPhoneState] = useState(user.phone || '');
  // Prefer structured fields when available (stored in Profile or EmployersProfile).
  // Fall back to legacy `location` string when necessary.
  const legacyParts = (user.location || '').split(',').map(p => p.trim()).filter(Boolean);
  const initialCity = user.city || user.companyCity || legacyParts[0] || '';
  const initialState = user.stateprovince || user.companyRegion || legacyParts[1] || '';
  const initialCountry = user.country || user.companyCountry || legacyParts.slice(2).join(', ') || '';
  const [cityState, setCityState] = useState(initialCity);
  const [stateProvince, setStateProvince] = useState(initialState);
  const [country, setCountry] = useState(initialCountry);
  const [bioState, setBioState] = useState(user.bio || '');
  const [gender, setGender] = useState(user.gender || '');
  const [dob, setDob] = useState(user.dob ? new Date(user.dob).toISOString().substr(0,10) : '');
  const [nationality, setNationality] = useState(user.nationality || '');
  const [desiredJobType, setDesiredJobType] = useState(user.desiredJobType || 'Full-time');
  const [workArrangement, setWorkArrangement] = useState(user.workArrangement || 'On-site');
  const [expectedSalary, setExpectedSalary] = useState(user.expectedSalary || '');

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

  // upload resume and save resumeUrl to profile
  useEffect(() => {
    if (!resumeFile || !token) return;
    let cancelled = false;
    (async () => {
      try {
        const fd = new FormData();
        fd.append('file', resumeFile);
        const res = await fetch('/api/uploads', { method: 'POST', body: fd });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        if (cancelled) return;
        // save profile with resumeUrl
        try {
          const saved = await saveProfile({ ...profile, resumeUrl: data.url, __token: token });
          if (setProfile) setProfile(saved);
        } catch (err) {
          console.warn('Failed to save resumeUrl', err);
        }
      } catch (err) {
        console.warn('Resume upload failed', err);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeFile, token]);

  const handleAvatarEdit = () => {
    // open file picker instead of a plain edit state
    if (avatarInputRef.current) avatarInputRef.current.click();
  };

  const handleAvatarChange = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    // preview locally
    const url = URL.createObjectURL(f);
    // revoke previous preview when replacing
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(url);
    setAvatarFile(f);

    // upload to server via /api/uploads/logo then save profile.image
    try {
      const fd = new FormData();
      fd.append('logo', f);
      const res = await fetch('/api/uploads/logo', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      // save profile image url
      if (token) {
        try {
          const saved = await saveProfile({ ...profile, image: data.url, __token: token });
          if (setProfile) setProfile(saved);
        } catch (err) {
          console.warn('Failed to save profile image', err);
        }
      }
    } catch (err) {
      console.debug('Avatar upload skipped or failed', err);
    }
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  // Note: InputWrap was removed per request. Inputs are rendered directly.

  // lists: languages, skills, portfolio links, certifications
  const [languagesList, setLanguagesList] = useState(() => (profile && Array.isArray(profile.languages) ? profile.languages : []));
  const [newLanguage, setNewLanguage] = useState('');

  const [skillsList, setSkillsList] = useState(() => (profile && Array.isArray(profile.skills) ? profile.skills : []));
  const [newSkill, setNewSkill] = useState('');

  const [portfolioList, setPortfolioList] = useState([]);
  const [newPortfolio, setNewPortfolio] = useState('');

  const [certsList, setCertsList] = useState([]);
  const [newCert, setNewCert] = useState('');

  // education entries
  const [educationList, setEducationList] = useState(() => (profile && Array.isArray(profile.education) ? profile.education : []));
  const [newSchool, setNewSchool] = useState('');
  const [newDegree, setNewDegree] = useState('');
  const [newField, setNewField] = useState('');
  const [newStartYear, setNewStartYear] = useState('');
  const [newEndYear, setNewEndYear] = useState('');
  const [newStatus, setNewStatus] = useState('Enrolled');
  const [newEduDesc, setNewEduDesc] = useState('');

  function addIfNotEmpty(value, setter, clearSetter) {
    if (!value || !value.trim()) return;
    setter(prev => [...prev, value.trim()]);
    clearSetter('');
  }

  // Debounced save: collect fields we care about and send to backend
  const saveTimeout = useRef(null);
  const scheduleSave = (patch) => {
    if (!token) return; // only auto-save when authenticated
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      try {
        const payload = { ...profile, ...patch, __token: token };
        const saved = await saveProfile(payload);
        if (setProfile) setProfile(saved);
      } catch (err) {
        console.warn('Auto-save failed', err);
      }
    }, 700);
  };

  // immediate save helper (used when user clicks Save)
  const saveNow = async (patch) => {
    if (!token) return;
    try {
      const payload = { ...profile, ...patch, __token: token };
      const saved = await saveProfile(payload);
      if (setProfile) setProfile(saved);
    } catch (err) {
      console.warn('Save failed', err);
      alert('Failed to save. Please try again.');
    }
  };

  function removeAt(index, setter) {
    setter(prev => prev.filter((_, i) => i !== index));
  }

  // watch list changes and schedule save
  useEffect(() => {
    scheduleSave({ skills: skillsList });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillsList]);

  useEffect(() => {
    if (profile && Array.isArray(profile.skills)) setSkillsList(profile.skills);
  }, [profile]);

  // if profile loads from server, populate languages (and keep in sync)
  useEffect(() => {
    if (profile && Array.isArray(profile.languages)) setLanguagesList(profile.languages);
  }, [profile]);

  useEffect(() => {
    scheduleSave({ languages: languagesList });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languagesList]);

  useEffect(() => {
    scheduleSave({ portfolio: portfolioList });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolioList]);

  useEffect(() => {
    scheduleSave({ certifications: certsList });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certsList]);

  // keep education in sync with profile when it loads
  useEffect(() => {
    // populate education from server only on first load (don't overwrite local edits)
    if ((!educationList || educationList.length === 0) && profile && Array.isArray(profile.education)) {
      setEducationList(profile.education);
    }
  }, [profile, educationList]);

  // save education list when it changes
  useEffect(() => {
    scheduleSave({ education: educationList });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [educationList]);

  // save when a field is finished editing (on blur)
  const handleFieldBlur = () => {
    const loc = [cityState, stateProvince, country].filter(Boolean).join(', ');
    scheduleSave({ firstName, lastName, email: emailState, phone: phoneState, location: loc, bio: bioState, gender, dob, nationality, desiredJobType, workArrangement, expectedSalary });
  };

  // account modal state
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [isProcessingAccount, setIsProcessingAccount] = useState(false);

  const handleDeactivate = async () => {
    if (!token) return;
    setIsProcessingAccount(true);
    try {
      const res = await fetch('/api/account/deactivate', { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error('Request failed');
      // clear local auth and redirect to login
      localStorage.removeItem('wc_token');
      localStorage.removeItem('wc_userId');
      if (setProfile) setProfile(null);
      window.location.href = '/login';
    } catch (err) {
      console.error('Deactivate failed', err);
      alert('Failed to deactivate account. Please try again.');
    } finally {
      setIsProcessingAccount(false);
      setShowAccountModal(false);
    }
  };

  const handleDeleteAccount = async () => {
    // now handled by the password confirm modal; this function will be replaced
    return;
  };

  // password confirm modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const [confirmAction, setConfirmAction] = useState('');

  const openPasswordConfirm = (action = 'delete') => {
    setConfirmPassword('');
    setConfirmError('');
    setConfirmAction(action);
    setShowPasswordModal(true);
  };

  // generic submit for delete or deactivate using password
  const submitConfirmWithPassword = async () => {
    if (!token) return;
    if (!confirmPassword || confirmPassword.length < 6) {
      setConfirmError('Please enter your password.');
      return;
    }
    setIsDeleting(true);
    try {
      let res;
      if (confirmAction === 'deactivate') {
        res = await fetch('/api/account/deactivate', { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ password: confirmPassword }) });
      } else {
        // default to delete
        res = await fetch('/api/account', { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ password: confirmPassword }) });
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setConfirmError(data && data.message ? data.message : 'Request failed.');
        return;
      }
      // success: clear auth and redirect
      localStorage.removeItem('wc_token');
      localStorage.removeItem('wc_userId');
      if (setProfile) setProfile(null);
      window.location.href = '/login';
    } catch (err) {
      console.error('Action failed', err);
      setConfirmError('Failed to perform action. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowPasswordModal(false);
      setShowAccountModal(false);
    }
  };


  return (
    <div className="profile-page">
      <div className="profile-center">
        <header className="profile-top">
          <div className="profile-top-left">
            <div className="profile-avatar large" role="button" tabIndex={0} onClick={handleAvatarEdit} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAvatarEdit(); }} aria-label="Change profile picture">
              <img src={avatarPreview || user.image} alt={`${user.firstName} ${user.lastName}`} />
              
              <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </div>
            <div className="profile-meta">
              <h1 className="profile-name">{user.firstName} {user.lastName}</h1>
              <p className="profile-role">{user.role}</p>
              <p className="profile-contact">{user.email} · {user.phone}</p>
              <p className="profile-location">{user.location}</p>
            </div>
          </div>
          
        </header>

        <div className="profile-grid">
          <main className="profile-main">
            <section className="card">
              <div className="card-body">
                <div className="card-header">
                  <h3>Basic Information</h3>
                  <button className={`edit-btn ${editingBasic ? 'save' : ''}`} onClick={async () => {
                    if (editingBasic) {
                      // save
                      const loc = [cityState, stateProvince, country].filter(Boolean).join(', ');
                      await saveNow({ firstName, lastName, email: emailState, phone: phoneState, location: loc, bio: bioState });
                    }
                    setEditingBasic(!editingBasic);
                  }}>{editingBasic ? 'Save' : 'Edit'}</button>
                </div>
                <div className="form-row two-col">
                  <div>
                    <label>First Name</label>
                    <div className="input-wrap">
                          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} onBlur={handleFieldBlur} readOnly={!editingBasic} />
                    </div>
                  </div>
                  <div>
                    <label>Last Name</label>
                    <div className="input-wrap">
                          <input value={lastName} onChange={(e) => setLastName(e.target.value)} onBlur={handleFieldBlur} readOnly={!editingBasic} />
                    </div>
                  </div>
                </div>
                {/* Job Title / Role removed as requested */}
                <div className="form-row two-col">
                  <div>
                    <label>Contact (Email)</label>
                    <div className="input-wrap">
                      <input value={emailState} onChange={(e) => setEmailState(e.target.value)} onBlur={handleFieldBlur} readOnly={!editingBasic} />
                    </div>
                  </div>
                  <div>
                    <label>Phone</label>
                    <div className="input-wrap">
                      <input value={phoneState} onChange={(e) => setPhoneState(e.target.value)} onBlur={handleFieldBlur} readOnly={!editingBasic} />
                    </div>
                  </div>
                </div>
                <div className="form-row two-col">
                  <div>
                    <label>City</label>
                    <div className="input-wrap">
                      <input value={cityState} onChange={(e) => setCityState(e.target.value)} onBlur={handleFieldBlur} />
                    </div>
                  </div>
                  <div>
                    <div className="province-country">
                      <div>
                        <label>Province / State</label>
                        <div className="input-wrap">
                          <input placeholder="Province / State" value={stateProvince} onChange={(e) => setStateProvince(e.target.value)} onBlur={handleFieldBlur} />
                        </div>
                      </div>
                      <div>
                        <label>Country</label>
                        <div className="input-wrap">
                          <input placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} onBlur={handleFieldBlur} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="form-row">
                  <label>About / Bio</label>
                  <div className="input-wrap">
                    <textarea value={bioState} onChange={(e) => setBioState(e.target.value)} onBlur={handleFieldBlur} placeholder="Tell employers about yourself, your career goals and strengths." rows={5} readOnly={!editingBasic} />
                  </div>
                </div>
              </div>
            </section>

            <section className="card">
              <div className="card-body">
                <div className="card-header">
                  <h3>Educational Background</h3>
                  <button className={`edit-btn ${editingEducation ? 'save' : ''}`} onClick={async () => {
                    if (editingEducation) {
                      await saveNow({ education: educationList });
                    }
                    setEditingEducation(!editingEducation);
                  }}>{editingEducation ? 'Save' : 'Edit'}</button>
                </div>
                <div className="form-row">
                  <label>Education</label>
                  <div className="list-input">
                    <div className="chips">
                      {educationList.map((e, i) => (
                        <span className="chip" key={i}>{e.school} — {e.degree} ({e.startYear}{e.endYear ? ' – ' + e.endYear : ' – Present'}) · {e.status} <button onClick={() => removeAt(i, setEducationList)} className="chip-remove" aria-label={`Remove ${e.school}`} disabled={!editingEducation}>×</button></span>
                      ))}
                    </div>
                    <div className="add-row education-add">
                      <input value={newSchool} onChange={(e) => setNewSchool(e.target.value)} placeholder="School / Institution" disabled={!editingEducation} />
                      <input value={newDegree} onChange={(e) => setNewDegree(e.target.value)} placeholder="Degree / Program" disabled={!editingEducation} />
                      <input value={newField} onChange={(e) => setNewField(e.target.value)} placeholder="Field of Study (optional)" disabled={!editingEducation} />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input value={newStartYear} onChange={(e) => setNewStartYear(e.target.value)} placeholder="Start Year (e.g. 2019)" />
                        <input value={newEndYear} onChange={(e) => setNewEndYear(e.target.value)} placeholder="End Year (e.g. 2023) or Present" />
                      </div>
                      <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                        <option>Enrolled</option>
                        <option>Graduated</option>
                        <option>On leave</option>
                        <option>Withdrawn</option>
                      </select>
                      <input value={newEduDesc} onChange={(e) => setNewEduDesc(e.target.value)} placeholder="Short description (optional)" />
                      <button type="button" className="add-btn" onClick={() => {
                        if (!editingEducation) return;
                        if (!newSchool.trim()) return;
                        setEducationList(prev => [...prev, { school: newSchool.trim(), degree: newDegree.trim(), field: newField.trim(), startYear: newStartYear.trim(), endYear: newEndYear.trim(), status: newStatus, desc: newEduDesc.trim() }]);
                        setNewSchool(''); setNewDegree(''); setNewField(''); setNewStartYear(''); setNewEndYear(''); setNewStatus('Enrolled'); setNewEduDesc('');
                      }}>+</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="card">
              <div className="card-body">
                <div className="card-header">
                  <h3>Professional Information</h3>
                  <button className={`edit-btn ${editingProfessional ? 'save' : ''}`} onClick={async () => {
                    if (editingProfessional) {
                      await saveNow({ skills: skillsList, portfolio: portfolioList, certifications: certsList });
                    }
                    setEditingProfessional(!editingProfessional);
                  }}>{editingProfessional ? 'Save' : 'Edit'}</button>
                </div>

                <div className="form-row">
                  <label>Skills</label>
                  <div className="list-input">
                    <div className="chips">
                      {skillsList.map((s, i) => (
                        <span className="chip" key={i}>{s}<button onClick={() => removeAt(i, setSkillsList)} className="chip-remove" aria-label={`Remove ${s}`} disabled={!editingProfessional}>×</button></span>
                      ))}
                    </div>
                    <div className="add-row">
                      <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Add skill" disabled={!editingProfessional} />
                      <button type="button" className="add-btn" onClick={() => { if (editingProfessional) addIfNotEmpty(newSkill, setSkillsList, setNewSkill); }}>+</button>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <label>Experience</label>
                  <div className="experience-item">
                    <div className="input-wrap"><input placeholder="Company" /></div>
                    <div className="input-wrap"><input placeholder="Position" /></div>
                    <div className="input-wrap"><input placeholder="Duration (e.g. 2019 - 2021)" /></div>
                    <div className="input-wrap"><textarea placeholder="Short description" rows={3}></textarea></div>
                  </div>
                </div>

                <div className="form-row">
                  <label>Certifications / Training</label>
                  <div className="list-input">
                    <div className="chips">
                      {certsList.map((c, i) => (
                        <span className="chip" key={i}>{c}<button onClick={() => removeAt(i, setCertsList)} className="chip-remove" aria-label={`Remove ${c}`} disabled={!editingProfessional}>×</button></span>
                      ))}
                    </div>
                    <div className="add-row">
                      <input value={newCert} onChange={(e) => setNewCert(e.target.value)} placeholder="Add certification" disabled={!editingProfessional} />
                      <button type="button" className="add-btn" onClick={() => { if (editingProfessional) addIfNotEmpty(newCert, setCertsList, setNewCert); }}>+</button>
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
                    <div className="input-wrap">
                      <select value={gender} onChange={(e) => setGender(e.target.value)} onBlur={handleFieldBlur}>
                        <option value="">Prefer not to say</option>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label>Date of Birth</label>
                    <div className="input-wrap">
                      <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} onBlur={handleFieldBlur} />
                    </div>
                  </div>
                </div>
                <div className="form-row">
                  <label>Nationality</label>
                  <div className="input-wrap"><input value={nationality} onChange={(e) => setNationality(e.target.value)} onBlur={handleFieldBlur} /></div>
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
                  <div className="input-wrap">
                    <select value={desiredJobType} onChange={(e) => setDesiredJobType(e.target.value)} onBlur={handleFieldBlur}>
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Internship</option>
                      <option>Contract</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <label>Work Arrangement</label>
                  <div className="input-wrap">
                    <select value={workArrangement} onChange={(e) => setWorkArrangement(e.target.value)} onBlur={handleFieldBlur}>
                      <option>On-site</option>
                      <option>Remote</option>
                      <option>Hybrid</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <label>Expected Salary (optional)</label>
                  <div className="input-wrap"><input value={expectedSalary} onChange={(e) => setExpectedSalary(e.target.value)} onBlur={handleFieldBlur} placeholder="e.g. 30,000 - 45,000 EUR" /></div>
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
                  <button className="danger" onClick={() => setShowAccountModal(true)}>Deactivate / Delete Account</button>
                </div>
              </div>
            </section>
          </aside>
        </div>
        {showAccountModal && (
          <div className="wc-modal-backdrop" role="dialog" aria-modal="true" onClick={() => { if (!isProcessingAccount) setShowAccountModal(false); }}>
            <div className="wc-modal" role="document" onClick={(e) => e.stopPropagation()}>
              <h3>Account actions</h3>
              <div className="action-descs">
                <div className="action-desc">
                  <strong>Deactivate</strong>
                  <div className="action-text">Temporarily hides your profile and content. You can reactivate later.</div>
                  <div className="action-actions">
                    <button className="secondary" onClick={() => { if (!isProcessingAccount) openPasswordConfirm('deactivate'); }} disabled={isProcessingAccount}>Deactivate</button>
                  </div>
                </div>
                <div className="action-desc">
                  <strong className="danger-label">Delete</strong>
                  <div className="action-text">Permanently removes your account and all associated data. This action is irreversible.</div>
                  <div className="action-actions">
                    <button className="danger" onClick={() => { if (!isProcessingAccount) openPasswordConfirm(); }} disabled={isProcessingAccount}>Delete</button>
                  </div>
                </div>
              </div>
              <div className="modal-actions" style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="edit-btn" onClick={() => { if (!isProcessingAccount) setShowAccountModal(false); }} disabled={isProcessingAccount}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        {showPasswordModal && (
          <div className="wc-modal-backdrop" role="dialog" aria-modal="true" onClick={() => { if (!isDeleting) setShowPasswordModal(false); }}>
            <div className="wc-modal" role="document" onClick={(e) => e.stopPropagation()}>
              <h3>Confirm account deletion</h3>
              <p>Enter your password to confirm permanent deletion of your account.</p>
              <div style={{ marginTop: 12 }}>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Your password" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e6e6e9' }} />
                {confirmError && <div className="confirm-error" style={{ marginTop: 8 }}>{confirmError}</div>}
              </div>
              <div className="modal-actions" style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="secondary" onClick={() => { if (!isDeleting) setShowPasswordModal(false); }} disabled={isDeleting}>Cancel</button>
                <button className="danger" onClick={() => { if (!isDeleting) submitConfirmWithPassword(); }} disabled={isDeleting}>{confirmAction === 'deactivate' ? 'Deactivate account' : 'Delete account'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
