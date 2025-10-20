import React, { useState, useRef, useEffect } from 'react';
import { COUNTRIES as ALL_COUNTRIES } from '../../data/countries';
import { useJobs } from '../../contexts/JobsContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ToastProvider';
import './JobPosting.css';

export default function EmployerJobs() {
  const { addJob } = useJobs();
  const { profile, userId, token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    company: '',
    category: '',
    type: '',
    status: 'Active',
    summary: '',
    description: '',
    responsibilities: '',
    requirements: '',
    preferred: '',
    skills: '',
    experienceLevel: '',
    educationLevel: '',
  minSalary: '',
  maxSalary: '',
  currency: '',
  salaryFrequency: 'annual',
    benefits: '',
    location: '',
    workArrangement: 'remote',
    deadline: '',
    numberOpenings: 1,
    applicationMethod: 'internal', // internal | external | email
    applicationTarget: '',
    postedDate: new Date().toISOString().slice(0,10),
    expirationDate: '',
    logoName: '',
  });
  // employer posted jobs UI state
  const [postedJobs, setPostedJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);

  async function loadPostedJobs() {
    // allow using userId from auth even if full profile hasn't loaded yet
    if (!profile && !userId) return;
    setLoadingJobs(true);
    try {
      const employerId = (profile && (profile.userId || profile._id)) || userId;
      const base = process.env.REACT_APP_API_BASE || '';
      const res = await fetch(`${base}/api/jobs?createdBy=${encodeURIComponent(employerId)}`);
      if (res.ok) {
        const data = await res.json();
        setPostedJobs(data || []);
        if (data && data.length && !selectedJobId) setSelectedJobId(data[0]._id || data[0].id);
      }
    } catch (err) {
      console.warn('Could not load posted jobs', err);
    } finally {
      setLoadingJobs(false);
    }
  }

  useEffect(() => { loadPostedJobs(); }, [profile]);
  const [city, setCity] = useState('');
  const [stateOrProvince, setStateOrProvince] = useState('');
  const [country, setCountry] = useState('');
  const [countryQuery, setCountryQuery] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countryHighlight, setCountryHighlight] = useState(0);
  const countryInputRef = useRef(null);
  const toggleRefs = useRef({ remote: null, hybrid: null, onsite: null });


  const [logoPreview, setLogoPreview] = useState('');
  const [postedSuccess, setPostedSuccess] = useState(false);
  const [postedId, setPostedId] = useState(null);
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);
  const [serverConfirmed, setServerConfirmed] = useState(false);
  const toast = useToast();

  const onChange = (e) => {
    const { name, value, type } = e.target;
    // keep number fields empty when cleared (don't coerce empty string to 0)
    if (type === 'number') {
      const v = value === '' ? '' : Number(value);
      setForm({ ...form, [name]: v });
    } else setForm({ ...form, [name]: value });
    // clear error for the field while typing
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const onFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setForm(prev => ({ ...prev, logoName: f.name }));
    // create local preview (not uploaded)
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const onRemoveLogo = () => {
    setLogoPreview('');
    setForm(prev => ({ ...prev, logoName: '' }));
    // clear the hidden file input if present
    if (formRef.current) {
      const fileInput = formRef.current.querySelector('input[type="file"]#logo-upload');
      if (fileInput) {
        try {
          fileInput.value = null;
        } catch (e) {
          // fallback: replace the node
          const replacement = fileInput.cloneNode(true);
          replacement.addEventListener && replacement.addEventListener('change', onFileChange);
          fileInput.parentNode && fileInput.parentNode.replaceChild(replacement, fileInput);
        }
      }
    }
  };

  function validate() {
    const next = {};
    if (!form.title || !form.title.trim()) next.title = 'Job title is required';
    if (!form.company || !form.company.trim()) next.company = 'Company name is required';
    if (!form.numberOpenings || Number(form.numberOpenings) < 1) next.numberOpenings = 'Enter at least 1 opening';

    // salary validation: if either min or max provided, require both and ensure min <= max
    const minVal = form.minSalary === '' ? null : Number(form.minSalary);
    const maxVal = form.maxSalary === '' ? null : Number(form.maxSalary);
    if (minVal !== null || maxVal !== null) {
      if (minVal === null || isNaN(minVal)) next.minSalary = 'Enter a valid minimum salary';
      if (maxVal === null || isNaN(maxVal)) next.maxSalary = 'Enter a valid maximum salary';
      if ((minVal !== null && maxVal !== null) && minVal > maxVal) next.minSalary = 'Minimum must be less than or equal to maximum';
      if (!form.currency || !form.currency.trim()) next.currency = 'Select a currency';
      if (!form.salaryFrequency) next.salaryFrequency = 'Select frequency';
    }

    // application target validation
    if (form.applicationMethod === 'external') {
      if (!form.applicationTarget || !form.applicationTarget.trim()) next.applicationTarget = 'Application URL is required for External Link';
      else if (!isValidUrl(form.applicationTarget)) next.applicationTarget = 'Please enter a valid URL (including https://)';
    }
    if (form.applicationMethod === 'email') {
      if (!form.applicationTarget || !form.applicationTarget.trim()) next.applicationTarget = 'Application email is required for Email method';
      else if (!isValidEmail(form.applicationTarget)) next.applicationTarget = 'Please enter a valid email address';
    }

    // onsite / hybrid location validation
    if (form.workArrangement === 'onsite' || form.workArrangement === 'hybrid') {
      if (!city || !city.trim()) next.city = 'City is required for on-site roles';
      if (!stateOrProvince || !stateOrProvince.trim()) next.stateOrProvince = 'Province/State is required for on-site roles';
      if (!country || !country.trim()) next.country = 'Country is required for on-site roles';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidUrl(url) {
    try {
      const u = new URL(url);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch (e) {
      return false;
    }
  }

  async function onSubmit(e) {
    e.preventDefault?.();
    const ok = validate();
    if (!ok) {
      // wait a tick for errors to render, then focus
      setTimeout(() => focusFirstError(), 50);
      return; // errors set via validate()
    }
    // try to upload logo if a file was selected in the file input
    let uploadedLogo = null;
    try {
      if (formRef.current) {
        const fileInput = formRef.current.querySelector('input[type="file"]');
        if (fileInput && fileInput.files && fileInput.files[0]) {
          const f = fileInput.files[0];
          const fd = new FormData();
          fd.append('logo', f);
          const res = await fetch('/api/uploads/logo', { method: 'POST', body: fd });
          if (res.ok) uploadedLogo = await res.json();
          else console.warn('Logo upload failed', await res.text());
        }
      }
    } catch (err) {
      console.warn('Logo upload error', err);
      // continue without blocking job creation
    }

  // prepare payload — include key fields expected by backend/context
    const payload = {
      title: form.title,
      company: form.company,
      category: form.category,
      type: form.type,
      status: form.status,
      summary: form.summary || form.description?.slice(0, 120),
      description: form.description,
      responsibilities: form.responsibilities,
      requirements: form.requirements,
      preferred: form.preferred,
      skills: form.skills,
      experienceLevel: form.experienceLevel,
      educationLevel: form.educationLevel,
  minSalary: form.minSalary === '' ? null : Number(form.minSalary),
  maxSalary: form.maxSalary === '' ? null : Number(form.maxSalary),
  currency: form.currency,
    salaryFrequency: form.salaryFrequency,
      benefits: form.benefits,
  // prefer structured onsite/hybrid fields when provided
  location: (form.workArrangement === 'onsite' || form.workArrangement === 'hybrid') ? `${city}${stateOrProvince ? ', ' + stateOrProvince : ''}${country ? ', ' + country : ''}` : form.location,
  city: (form.workArrangement === 'onsite' || form.workArrangement === 'hybrid') ? city : null,
  stateOrProvince: (form.workArrangement === 'onsite' || form.workArrangement === 'hybrid') ? stateOrProvince : null,
  country: (form.workArrangement === 'onsite' || form.workArrangement === 'hybrid') ? country : null,
      workArrangement: form.workArrangement,
      numberOpenings: form.numberOpenings,
      applicationMethod: form.applicationMethod,
      applicationTarget: form.applicationTarget,
      postedAt: form.postedDate,
      expirationDate: form.expirationDate,
      logoName: uploadedLogo?.name || form.logoName || null,
      logoUrl: uploadedLogo?.url || null,
    };

    try {
      // attach current employer id so the job is saved to their account
      if (profile && (profile.userId || profile._id)) payload.createdBy = profile.userId || profile._id;
      let savedJob = null;
      let fromServer = false;
      if (selectedJobId) {
        // update existing job via PUT
        const base = process.env.REACT_APP_API_BASE || '';
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`${base}/api/jobs/${encodeURIComponent(selectedJobId)}`, { method: 'PUT', headers, body: JSON.stringify(payload) });
        if (res.ok) {
          savedJob = await res.json();
          fromServer = true;
        } else {
          console.warn('Failed to update job', await res.text());
        }
      } else {
        const res = await addJob(payload);
        if (res && res.job) {
          savedJob = res.job;
          fromServer = !!res.fromServer;
        }
      }

      // refresh the employer job list and select the updated/created job
      await loadPostedJobs();
      if (savedJob) {
        const id = savedJob._id || savedJob.id || savedJob.id;
        setSelectedJobId(id);
        setPostedId(id);
      }

      // navigate employer to applicants page so they immediately see what they posted
      try { navigate('/employer/applicants'); } catch (e) { /* ignore navigation errors */ }

      if (fromServer) {
        setServerConfirmed(true);
        toast.success('Job posted successfully');
        setTimeout(() => setServerConfirmed(false), 5000);
      } else {
        // local fallback — show only inline minor banner
        setPostedSuccess(true);
        toast.success('Job posted (local fallback)');
        setTimeout(() => setPostedSuccess(false), 4000);
      }
    } catch (e) {
      const msg = (e && e.message) || 'Failed to post job';
      toast.error(msg);
    }

    // reset form after posting
    setForm({
      title: '',
      company: '',
      category: '',
      type: '',
      status: 'Active',
      summary: '',
      description: '',
      responsibilities: '',
      requirements: '',
      preferred: '',
      skills: '',
      experienceLevel: '',
      educationLevel: '',
  minSalary: '',
  maxSalary: '',
  currency: '',
  salaryFrequency: 'annual',
      benefits: '',
      location: '',
      workArrangement: 'remote',
      deadline: '',
      numberOpenings: 1,
      applicationMethod: 'internal',
      applicationTarget: '',
      postedDate: new Date().toISOString().slice(0,10),
      expirationDate: '',
      logoName: '',
    });
    setCity('');
    setStateOrProvince('');
    setCountry('');
    setCountryQuery('');
    setLogoPreview('');
  }

  // toast is provided by ToastProvider

  // handle arrow navigation for segmented control
  function handleToggleKey(e) {
    const order = ['remote','hybrid','onsite'];
    const idx = order.indexOf(form.workArrangement);
    if (e.key === 'ArrowRight') {
      const next = order[(idx + 1) % order.length];
      setForm(prev => ({ ...prev, workArrangement: next }));
      setTimeout(() => toggleRefs.current[next]?.focus?.(), 0);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      const next = order[(idx - 1 + order.length) % order.length];
      setForm(prev => ({ ...prev, workArrangement: next }));
      setTimeout(() => toggleRefs.current[next]?.focus?.(), 0);
      e.preventDefault();
    }
  }

  const onCountryInput = (v) => {
    setCountryQuery(v);
    setShowCountryDropdown(true);
    setCountry(v);
    setCountryHighlight(0);
  };

  const filteredCountries = ALL_COUNTRIES.filter(c => c.toLowerCase().includes((countryQuery || country).toLowerCase()));

  function selectCountry(c) {
    setCountry(c);
    setCountryQuery(c);
    setShowCountryDropdown(false);
    setCountryHighlight(0);
  }

  function handleCountryKey(e) {
    if (!showCountryDropdown) return;
    if (e.key === 'ArrowDown') {
      setCountryHighlight(prev => Math.min(prev + 1, filteredCountries.length - 1));
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setCountryHighlight(prev => Math.max(prev - 1, 0));
      e.preventDefault();
    } else if (e.key === 'Enter') {
      const sel = filteredCountries[countryHighlight];
      if (sel) selectCountry(sel);
      e.preventDefault();
    } else if (e.key === 'Escape') {
      setShowCountryDropdown(false);
      e.preventDefault();
    }
  }

  // If validate() fails, call this to focus and scroll to the first invalid field
  function focusFirstError() {
    const keys = Object.keys(errors || {});
    if (!keys.length) return;
    const first = keys[0];
    // try to find inside the form first
    let el = null;
    if (formRef.current) el = formRef.current.querySelector(`[name="${first}"]`);
    if (!el) el = document.querySelector(`[name="${first}"]`);
    if (el && typeof el.focus === 'function') {
      el.focus();
      try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) { /* ignore */ }
    }
  }

  return (
    <div className="employer-applicants-root" style={{ padding: 24 }}>
      <div className="card job-posts" style={{ width: 360, flex: '0 0 360px' }}>
        <div className="card-header">
          <div style={{ fontWeight:700 }}>Jobs Posted ({postedJobs.length})</div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="jobposting-btn" onClick={() => { setShowForm(true); setSelectedJobId(null); setForm({ title:'', company:'', category:'', type:'', status:'Active', summary:'', description:'', responsibilities:'', requirements:'', preferred:'', skills:'', experienceLevel:'', educationLevel:'', minSalary:'', maxSalary:'', currency:'', salaryFrequency:'annual', benefits:'', location:'', workArrangement:'remote', deadline:'', numberOpenings:1, applicationMethod:'internal', applicationTarget:'', postedDate:new Date().toISOString().slice(0,10), expirationDate:'', logoName:'' }); }}>Post New Job</button>
          </div>
        </div>
        <div className="card-body list-body">
          {loadingJobs ? <div className="empty">Loading…</div> : (
            postedJobs.length === 0 ? <div className="empty">No jobs posted yet</div> : (
              postedJobs.map(j => (
                <div key={j._id || j.id} className={`job-item ${selectedJobId === (j._id||j.id) ? 'active' : ''}`} onClick={() => { setSelectedJobId(j._id||j.id); setShowForm(false); }}>
                  <div className="job-item-left">
                    <div className="job-avatar">
                      { (j.logoUrl || j.logo) ? (
                        <img src={j.logoUrl || j.logo} alt={`${j.company || 'Company'} logo`} />
                      ) : null }
                    </div>
                  </div>
                  <div className="job-item-body">
                    <div className="job-title">{j.title}</div>
                    <div className="job-meta">{j.company} • {j.location || j.city || ''}</div>
                  </div>
                  <div className="job-meta" style={{ marginLeft: 'auto' }}>Applicants: {j.applicantsCount || '0'}</div>
                </div>
              ))
            )
          )}
        </div>
      </div>

      <div className="card applicants-panel" style={{ flex:1 }}>
        <div className="card-header">
          <div style={{ fontWeight:700 }}>{showForm ? (selectedJobId ? 'Edit Job' : 'Post a New Job') : 'Job Details'}</div>
          <div className="header-actions">
            {!showForm && selectedJobId && (
              <button className="wc-btn" onClick={() => {
                // populate form for edit
                const job = postedJobs.find(j => (j._id||j.id) === selectedJobId) || {};
                setForm({
                  title: job.title || '',
                  company: job.company || '',
                  category: job.category || '',
                  type: job.type || '',
                  status: job.status || 'Active',
                  summary: job.summary || '',
                  description: job.description || '',
                  responsibilities: job.responsibilities || '',
                  requirements: job.requirements || '',
                  preferred: job.preferred || '',
                  skills: job.skills || '',
                  experienceLevel: job.experienceLevel || '',
                  educationLevel: job.educationLevel || '',
                  minSalary: job.minSalary == null ? '' : job.minSalary,
                  maxSalary: job.maxSalary == null ? '' : job.maxSalary,
                  currency: job.currency || '',
                  salaryFrequency: job.salaryFrequency || 'annual',
                  benefits: job.benefits || '',
                  location: job.location || '',
                  workArrangement: job.workArrangement || (job.location ? 'onsite' : 'remote'),
                  deadline: job.deadline || job.applicationDeadline || '',
                  numberOpenings: job.numberOpenings || job.openings || 1,
                  applicationMethod: job.applicationMethod || 'internal',
                  applicationTarget: job.applicationTarget || '',
                  postedDate: (job.postedAt || job.postedDate || new Date().toISOString().slice(0,10)).toString().slice(0,10),
                  expirationDate: job.expirationDate || '',
                  logoName: job.logoName || '',
                });
                setCity(job.city || '');
                setStateOrProvince(job.stateOrProvince || job.state || '');
                setCountry(job.country || '');
                setLogoPreview(job.logoUrl || '');
                setShowForm(true);
              }}>Edit Job Post</button>
            )}
            
          </div>
        </div>
        <div className="card-body applicants-body" style={{ flex: 1, overflow: 'auto', minHeight:0, maxHeight: 'calc(100vh - 200px)' }}>
          {showForm ? (
            <form className="jobposting-form" onSubmit={onSubmit} ref={formRef}>
              {/* 1. Basic Information */}
              <section className="jobposting-section">
                <h3>1. Basic Information</h3>
                <div className="jobposting-grid-2">
                  <div>
                    <input name="title" placeholder="Job Title" value={form.title} onChange={onChange} className={`jobposting-input ${errors.title ? 'invalid' : ''}`} />
                    {errors.title && <div className="jobposting-error">{errors.title}</div>}
                  </div>
                  <div>
                    <input name="company" placeholder="Company Name" value={form.company} onChange={onChange} className={`jobposting-input ${errors.company ? 'invalid' : ''}`} />
                    {errors.company && <div className="jobposting-error">{errors.company}</div>}
                  </div>
                  <select name="type" value={form.type} onChange={onChange} className="jobposting-input">
                    <option value="">Employment Type</option>
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                  <select name="category" value={form.category} onChange={onChange} className="jobposting-input">
                    <option value="">Job Category</option>
                    <option>Engineering</option>
                    <option>Design</option>
                    <option>Product</option>
                    <option>Marketing</option>
                    <option>Accounting</option>
                  </select>

                  <div className="form-row">
                    <label className="jobposting-small-label">Work arrangement</label>
                    <div className="toggle-row" role="tablist" aria-label="Work arrangement" onKeyDown={handleToggleKey}>
                      <button
                        ref={el => toggleRefs.current.remote = el}
                        type="button"
                        className={`toggle-btn ${form.workArrangement === 'remote' ? 'active' : ''}`}
                        onClick={() => setForm(prev => ({ ...prev, workArrangement: 'remote' }))}
                        aria-pressed={form.workArrangement === 'remote'}
                      >
                        Remote
                      </button>
                      <button
                        ref={el => toggleRefs.current.hybrid = el}
                        type="button"
                        className={`toggle-btn ${form.workArrangement === 'hybrid' ? 'active' : ''}`}
                        onClick={() => setForm(prev => ({ ...prev, workArrangement: 'hybrid' }))}
                        aria-pressed={form.workArrangement === 'hybrid'}
                      >
                        Hybrid
                      </button>
                      <button
                        ref={el => toggleRefs.current.onsite = el}
                        type="button"
                        className={`toggle-btn ${form.workArrangement === 'onsite' ? 'active' : ''}`}
                        onClick={() => setForm(prev => ({ ...prev, workArrangement: 'onsite' }))}
                        aria-pressed={form.workArrangement === 'onsite'}
                      >
                        On-site
                      </button>
                    </div>
                  </div>

                  {form.workArrangement === 'remote' ? (
                    <div className="form-row">
                      <label className="jobposting-small-label" htmlFor="location">Location</label>
                      <input
                        id="location"
                        name="location"
                        className={`jobposting-input ${errors.location ? 'invalid' : ''}`}
                        value={form.location}
                        onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Optional: e.g. Remote or timezone (e.g. UTC-5)"
                      />
                      {errors.location && <div className="jobposting-error">{errors.location}</div>}
                    </div>
                  ) : (
                    <div className="location-grid">
                      <div className="form-row">
                        <label className="jobposting-small-label" htmlFor="city">City</label>
                        <input
                          id="city"
                          name="city"
                          className={`jobposting-input ${errors.city ? 'invalid' : ''}`}
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Vancouver"
                        />
                        {errors.city && <div className="jobposting-error">{errors.city}</div>}
                      </div>
                      <div className="form-row">
                        <label className="jobposting-small-label" htmlFor="stateOrProvince">Province / State</label>
                        <input
                          id="stateOrProvince"
                          name="stateOrProvince"
                          className={`jobposting-input ${errors.stateOrProvince ? 'invalid' : ''}`}
                          value={stateOrProvince}
                          onChange={(e) => setStateOrProvince(e.target.value)}
                          placeholder="e.g. BC / California"
                        />
                        {errors.stateOrProvince && <div className="jobposting-error">{errors.stateOrProvince}</div>}
                      </div>
                      <div className="form-row" style={{ position: 'relative' }}>
                        <label className="jobposting-small-label" htmlFor="country">Country</label>
                        <input
                          id="country"
                          name="country"
                          ref={countryInputRef}
                          className={`jobposting-input wc-search ${errors.country ? 'invalid' : ''}`}
                          value={countryQuery || country}
                          onChange={(e) => onCountryInput(e.target.value)}
                          onKeyDown={handleCountryKey}
                          onFocus={() => setShowCountryDropdown(true)}
                          placeholder="Start typing to search country"
                          autoComplete="off"
                        />
                        {showCountryDropdown && filteredCountries.length > 0 && (
                          <ul className="country-dropdown" role="listbox" style={{ position: 'absolute', zIndex: 40, background: '#fff', border: '1px solid #e6e9ee', width: '100%', marginTop: 6, borderRadius: 8, maxHeight: 180, overflow: 'auto' }}>
                            {filteredCountries.map((c, i) => (
                              <li key={c}
                                role="option"
                                aria-selected={countryHighlight === i}
                                onMouseDown={(ev) => { ev.preventDefault(); selectCountry(c); }}
                                onMouseEnter={() => setCountryHighlight(i)}
                                style={{ padding: '8px 10px', background: countryHighlight === i ? '#f1f5f9' : '#fff', cursor: 'pointer' }}
                              >{c}</li>
                            ))}
                          </ul>
                        )}
                        {errors.country && <div className="jobposting-error">{errors.country}</div>}
                      </div>
                    </div>
                  )}

                  <div className="jobposting-flex">
                    <div style={{ flex: 1 }}>
                      <label className="jobposting-small-label">Company Logo (optional)</label>
                      <div className="logo-row">
                        <label className="jobposting-file" htmlFor="logo-upload" style={{ display: 'inline-flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <path d="M12 16V4" stroke="#0aa96f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 8l4-4 4 4" stroke="#0aa96f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <rect x="3" y="18" width="18" height="2" rx="1" fill="#0aa96f" />
                          </svg>
                          <span>Upload logo</span>
                        </label>
                        <input id="logo-upload" type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />
                        <div className="logo-preview-wrap">
                          {logoPreview ? (
                            <img src={logoPreview} alt="logo" className="logo-preview" />
                          ) : (
                            <div className="logo-placeholder">No logo uploaded</div>
                          )}
                          {(logoPreview || form.logoName) && (
                            <button type="button" className="logo-remove-overlay" aria-label="Remove logo" onClick={onRemoveLogo}>
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. Job Details */}
              <section className="jobposting-section">
                <h3>2. Job Details</h3>
                <div className="jobposting-grid">
                  <textarea name="description" placeholder="Job Description" value={form.description} onChange={onChange} className={`jobposting-textarea ${errors.description ? 'invalid' : ''}`} />
                  {errors.description && <div className="jobposting-error">{errors.description}</div>}
                  <textarea name="responsibilities" placeholder="Responsibilities" value={form.responsibilities} onChange={onChange} className={`jobposting-textarea ${errors.responsibilities ? 'invalid' : ''}`} />
                  {errors.responsibilities && <div className="jobposting-error">{errors.responsibilities}</div>}
                  <textarea name="requirements" placeholder="Qualifications / Requirements" value={form.requirements} onChange={onChange} className={`jobposting-textarea ${errors.requirements ? 'invalid' : ''}`} />
                  {errors.requirements && <div className="jobposting-error">{errors.requirements}</div>}
                  <input name="skills" placeholder="Skills (comma separated)" value={form.skills} onChange={onChange} className="jobposting-input" />
                  <div className="jobposting-flex">
                    <select name="experienceLevel" value={form.experienceLevel} onChange={onChange} className="jobposting-input">
                      <option value="">Experience Level</option>
                      <option>Entry</option>
                      <option>Mid</option>
                      <option>Senior</option>
                    </select>
                    <select name="educationLevel" value={form.educationLevel} onChange={onChange} className="jobposting-input">
                      <option value="">Education Level</option>
                      <option>Bachelor's</option>
                      <option>Master's</option>
                      <option>PhD</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* 3. Compensation */}
              <section className="jobposting-section">
                <h3>3. Compensation</h3>
                <div className="jobposting-grid">
                  <div className="salary-row">
                    <div>
                      <input type="number" name="minSalary" placeholder="Min salary" value={form.minSalary} onChange={onChange} className={`jobposting-input ${errors.minSalary ? 'invalid' : ''}`} />
                      {errors.minSalary && <div className="jobposting-error">{errors.minSalary}</div>}
                    </div>
                    <div>
                      <input type="number" name="maxSalary" placeholder="Max salary" value={form.maxSalary} onChange={onChange} className={`jobposting-input ${errors.maxSalary ? 'invalid' : ''}`} />
                      {errors.maxSalary && <div className="jobposting-error">{errors.maxSalary}</div>}
                    </div>
                    <div>
                      <select name="currency" value={form.currency} onChange={onChange} className={`jobposting-input ${errors.currency ? 'invalid' : ''}`}>
                        <option value="">Currency</option>
                        <option>USD</option>
                        <option>EUR</option>
                        <option>GBP</option>
                        <option>NGN</option>
                        <option>INR</option>
                      </select>
                      {errors.currency && <div className="jobposting-error">{errors.currency}</div>}
                    </div>
                    <div>
                      <select name="salaryFrequency" value={form.salaryFrequency} onChange={onChange} className={`jobposting-input ${errors.salaryFrequency ? 'invalid' : ''}`}>
                        <option value="annual">Annual</option>
                        <option value="hourly">Hourly</option>
                      </select>
                      {errors.salaryFrequency && <div className="jobposting-error">{errors.salaryFrequency}</div>}
                    </div>
                  </div>
                  <textarea name="benefits" placeholder="Benefits (comma separated)" value={form.benefits} onChange={onChange} className="jobposting-textarea" />
                </div>
              </section>

              {/* 4. Application Details */}
              <section className="jobposting-section">
                <h3>4. Application Details</h3>
                <div className="jobposting-grid-2">
                  <div>
                    <label className="jobposting-small-label">Application Deadline</label>
                    <input type="date" name="deadline" value={form.deadline} onChange={onChange} className={`jobposting-input ${errors.deadline ? 'invalid' : ''}`} />
                    {errors.deadline && <div className="jobposting-error">{errors.deadline}</div>}
                  </div>
                  <div>
                    <label className="jobposting-small-label">Number of Openings</label>
                    <input type="number" min={1} name="numberOpenings" value={form.numberOpenings} onChange={onChange} className={`jobposting-input ${errors.numberOpenings ? 'invalid' : ''}`} />
                    {errors.numberOpenings && <div className="jobposting-error">{errors.numberOpenings}</div>}
                  </div>

                  <div>
                    <label className="jobposting-small-label">Application Method</label>
                    <select name="applicationMethod" value={form.applicationMethod} onChange={onChange} className="jobposting-input">
                      <option value="internal">Internal Button</option>
                      <option value="external">External Link</option>
                      <option value="email">Email</option>
                    </select>
                  </div>

                  <div>
                    {(form.applicationMethod === 'external' || form.applicationMethod === 'email') && (
                      <>
                        <label className="jobposting-small-label">Application Target</label>
                        <input name="applicationTarget" placeholder={form.applicationMethod === 'external' ? 'Application URL' : 'Application Email'} value={form.applicationTarget} onChange={onChange} className={`jobposting-input ${errors.applicationTarget ? 'invalid' : ''}`} />
                        {errors.applicationTarget && <div className="jobposting-error">{errors.applicationTarget}</div>}
                      </>
                    )}
                  </div>
                </div>
              </section>

              {/* 5. Additional Metadata */}
              <section className="jobposting-section">
                <h3>5. Additional Metadata</h3>
                <div className="jobposting-grid-2">
                  <div>
                    <label className="jobposting-small-label">Posted Date</label>
                    <input type="date" name="postedDate" value={form.postedDate} onChange={onChange} className="jobposting-input" />
                  </div>
                  <div>
                    <label className="jobposting-small-label">Expiration Date</label>
                    <input type="date" name="expirationDate" value={form.expirationDate} onChange={onChange} className="jobposting-input" />
                  </div>

                  <div>
                    <label className="jobposting-small-label">Status</label>
                    <select name="status" value={form.status} onChange={onChange} className="jobposting-input">
                      <option>Active</option>
                      <option>Draft</option>
                      <option>Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="jobposting-small-label">Experience Level</label>
                    <select name="experienceLevel" value={form.experienceLevel} onChange={onChange} className="jobposting-input">
                      <option value="">—</option>
                      <option>Entry</option>
                      <option>Mid</option>
                      <option>Senior</option>
                    </select>
                  </div>
                </div>
              </section>

              <div className="jobposting-footer">
                <button type="submit" className="jobposting-btn">Post Job</button>
              </div>
            </form>
          ) : (
            // job details view
            (() => {
              const job = postedJobs.find(j => (j._id||j.id) === selectedJobId) || {};
              return (
                <div>
                  <h2 style={{ marginTop:0 }}>{job.title}</h2>
                  <div style={{ color:'var(--wc-muted)' }}>{job.company} • {job.location || job.city || ''}</div>
                  <hr />
                  <h4>Job Description</h4>
                  <div style={{ whiteSpace:'pre-wrap' }}>{job.description}</div>
                  <h4>Requirements</h4>
                  <div style={{ whiteSpace:'pre-wrap' }}>{job.requirements}</div>
                  <h4>Benefits</h4>
                  <div style={{ whiteSpace:'pre-wrap' }}>{job.benefits}</div>
                </div>
              );
            })()
          )}
        </div>
      </div>
  </div>
  );
}

// styles moved to JobPosting.css
