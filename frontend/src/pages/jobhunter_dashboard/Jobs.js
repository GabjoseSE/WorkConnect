import React, { useState, useRef, useEffect } from "react";
import './Jobs.css';
import { useJobs } from '../../contexts/JobsContext';
import { useAuth } from '../../contexts/AuthContext';
import { sendApplication } from '../../api/applications';

// small local formatter for salary display
function formatSalary(job) {
  if (!job) return '';
  if (job.salary) return job.salary;
  const min = job.minSalary;
  const max = job.maxSalary;
  const curr = (job.currency || '').toUpperCase();

  // human-friendly suffix based on frequency
  const freqMap = {
    hourly: '/hr',
    monthly: '/mo',
    annual: '/yr',
    yearly: '/yr'
  };
  const freq = freqMap[(job.salaryFrequency || '').toLowerCase()] || '/yr';

  if (min == null && max == null) return '';

  // map common currency codes to symbols when available
  const symbolMap = { USD: '$', EUR: '€', GBP: '£', NGN: '₦', INR: '₹', PHP: '₱' };
  const symbol = symbolMap[curr] || '';

  // format numbers with locale separators
  const fmt = (n) => (typeof n === 'number' ? new Intl.NumberFormat().format(n) : n);

  const prefix = symbol ? `${symbol} ` : (curr ? `${curr} ` : '');

  if (min != null && max != null) return `${prefix}${fmt(min)} - ${fmt(max)}${freq}`;
  if (min != null) return `${prefix}${fmt(min)}${freq}`;
  return `${prefix}${fmt(max)}${freq}`;
}

// Small helper component to render job descriptions with expand/collapse and optional sanitized HTML
function DescriptionBlock({ raw, htmlRaw, longLimit = 600 }) {
  const [showFull, setShowFull] = useState(false);
  const [renderHtml, setRenderHtml] = useState(false);

  const sanitizedHtml = (html) => {
    if (!html) return '';
    // Very small sanitizer: remove script tags and on* attributes
    // This is intentionally minimal — for production use a library like DOMPurify.
    return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
      .replace(/on\w+\s*=\s*'[^']*'/gi, '');
  };

  const content = raw || '';
  const isLong = content.length > longLimit;

  return (
    <div>
      {renderHtml && htmlRaw ? (
        <div style={{ color: '#444' }} dangerouslySetInnerHTML={{ __html: sanitizedHtml(htmlRaw) }} />
      ) : (
        <div style={{ color: '#444', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
          {isLong && !showFull ? `${content.slice(0, longLimit)}...` : content || 'No job description provided.'}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 10, alignItems: 'center' }}>
        {isLong && (
          <button className="wc-btn wc-btn-outline" onClick={() => setShowFull(s => !s)}>{showFull ? 'Show less' : 'Show more'}</button>
        )}
        {htmlRaw && (
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <input type="checkbox" checked={renderHtml} onChange={e => setRenderHtml(e.target.checked)} /> Render HTML
          </label>
        )}
      </div>
    </div>
  );
}

function Jobs() {
  const { jobs, savedJobs, toggleSave } = useJobs();
  const [selected, setSelected] = useState(null);
  // normalize selected when jobs load/change (jobs may be fetched async)
  useEffect(() => {
    if (!jobs || jobs.length === 0) return;
    // if no selected job, pick first
    if (!selected) {
      setSelected(jobs[0]);
      return;
    }
    // if current selected is no longer present, reset to first
    const selId = selected.id || selected._id;
    const found = jobs.find(j => (j.id || j._id) === selId);
    if (!found) setSelected(jobs[0]);
  }, [jobs, selected]);
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [remoteOption, setRemoteOption] = useState(null); // 'Remote' | 'On-site' | 'Hybrid'
  const [datePosted, setDatePosted] = useState(null); // '24h' | '7d' | '30d'
  const [openDropdown, setOpenDropdown] = useState(null);
  const filtersRef = useRef(null);
  const { profile, userId } = useAuth();

  // derive a sensible full name from various profile shapes
  const getFullName = (p) => {
    if (!p) return '';
    if (p.fullName) return p.fullName;
    if (p.name) return p.name;
    // common variations
    const first = p.firstName || p.firstname || p.givenName || p.given_name;
    const last = p.lastName || p.lastname || p.familyName || p.family_name;
    if (first && last) return `${first} ${last}`;
    if (first) return first;
    if (last) return last;
    return '';
  };

  // apply modal state
  const [showApply, setShowApply] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [availability, setAvailability] = useState('Full-time');
  const [submitting, setSubmitting] = useState(false);
  // controlled fields for apply modal so user can edit
  const [applyFullName, setApplyFullName] = useState('');
  const [applyEmail, setApplyEmail] = useState('');
  const [applyContact, setApplyContact] = useState('');
  const [applyResumeUrl, setApplyResumeUrl] = useState('');
  const [applyCvFile, setApplyCvFile] = useState(null);

  // seed modal fields from profile when available
  useEffect(() => {
    if (!profile) return;
    if (profile.expectedSalary) setExpectedSalary(profile.expectedSalary);
    // profile may have preferred availability or workArrangement
    if (profile.desiredJobType) setAvailability(profile.desiredJobType);
    else if (profile.workArrangement && (profile.workArrangement === 'Remote' || profile.workArrangement === 'Full-time' || profile.workArrangement === 'Part-time')) setAvailability(profile.workArrangement);
  }, [profile]);

  // prefill apply modal controlled inputs when modal opens or profile changes
  useEffect(() => {
    if (!showApply) return;
    setApplyFullName(getFullName(profile));
    setApplyEmail(profile?.email || '');
    setApplyContact(profile?.phone || '');
    setApplyResumeUrl(profile?.resumeUrl || '');
    setApplyCvFile(null);
  }, [showApply, profile]);

  useEffect(() => {
    function onDoc(e) {
      if (filtersRef.current && !filtersRef.current.contains(e.target)) setOpenDropdown(null);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  // apply text search first
  let filtered = jobs.filter(j => (j.title + ' ' + j.company + ' ' + j.location).toLowerCase().includes(query.toLowerCase()));

  // apply selected filters (support multiple active filters, AND logic)
  const active = selectedFilter ? (Array.isArray(selectedFilter) ? selectedFilter : [selectedFilter]) : [];
  if (active.length > 0) {
    filtered = filtered.filter(job => {
      return active.every(f => {
        switch (f) {
          case 'Not Applied': return !job.applied;
          case 'Exclusive Offers': return !!job.exclusive;
          default: return true;
        }
      });
    });
  }

  // Job Type dropdown filter
  if (selectedJobTypes.length > 0) {
    filtered = filtered.filter(job => selectedJobTypes.includes(job.type));
  }

  // Remote option filter
  if (remoteOption) {
    if (remoteOption === 'Remote') filtered = filtered.filter(j => j.isRemote);
    else if (remoteOption === 'On-site') filtered = filtered.filter(j => !j.isRemote && !j.isHybrid);
    else if (remoteOption === 'Hybrid') filtered = filtered.filter(j => j.isHybrid);
  }

  // Date posted filter
  if (datePosted) {
    const now = new Date();
    filtered = filtered.filter(job => {
      const posted = new Date(job.postedAt);
      const diffDays = (now - posted) / (1000 * 60 * 60 * 24);
      if (datePosted === '24h') return diffDays <= 1;
      if (datePosted === '7d') return diffDays <= 7;
      if (datePosted === '30d') return diffDays <= 30;
      return true;
    });
  }

  return (
    <div className="jobs-root page-content jobs-page">
    {/* normalize selected id for comparisons */}
    {null}
  <div className="jobs-inner">
        {/* search */}
        <div className="jobs-search">
          <input className="wc-search jobs-search-input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search jobs, company or location" />
          <button className="wc-btn wc-btn-outline">Search</button>
        </div>

  {/* filters */}
  <div className="jobs-filters" ref={filtersRef}>
    <div className="filters-row">
      <div className="filters-left">
              {/* Job Type dropdown */}
              <div className={`jobs-filter-wrap ${selectedJobTypes.length ? 'active' : ''}`}>
                <button className={`jobs-filter-pill ${selectedJobTypes.length ? 'active' : ''} ${openDropdown === 'jobType' ? 'open' : ''}`} onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === 'jobType' ? null : 'jobType'); }}>
                  <span>Job Type</span>
                  <svg className="jobs-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                {openDropdown === 'jobType' && (
                  <div className="jobs-dropdown-menu">
                    {['Full-time', 'Part-time', 'Contract'].map(opt => (
                      <label key={opt} className="jobs-dropdown-item"><input type="checkbox" checked={selectedJobTypes.includes(opt)} onChange={() => setSelectedJobTypes(prev => prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt])} /> {opt}</label>
                    ))}
                  </div>
                )}
              </div>

              {/* Remote dropdown */}
              <div className={`jobs-filter-wrap ${remoteOption ? 'active' : ''}`}>
                <button className={`jobs-filter-pill ${remoteOption ? 'active' : ''} ${openDropdown === 'remote' ? 'open' : ''}`} onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === 'remote' ? null : 'remote'); }}>
                  <span>Remote</span>
                  <svg className="jobs-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                {openDropdown === 'remote' && (
                  <div className="jobs-dropdown-menu">
                    {['Remote', 'On-site', 'Hybrid'].map(opt => (
                      <label key={opt} className="jobs-dropdown-item"><input type="radio" name="remote" checked={remoteOption === opt} onChange={() => setRemoteOption(opt)} /> {opt}</label>
                    ))}
                  </div>
                )}
              </div>

              {/* Date Posted dropdown */}
              <div className={`jobs-filter-wrap ${datePosted ? 'active' : ''}`}>
                <button className={`jobs-filter-pill ${datePosted ? 'active' : ''} ${openDropdown === 'date' ? 'open' : ''}`} onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === 'date' ? null : 'date'); }}>
                  <span>Date Posted</span>
                  <svg className="jobs-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                {openDropdown === 'date' && (
                  <div className="jobs-dropdown-menu">
                    <label className="jobs-dropdown-item"><input type="radio" name="date" checked={datePosted === '24h'} onChange={() => setDatePosted('24h')} /> Last 24 hours</label>
                    <label className="jobs-dropdown-item"><input type="radio" name="date" checked={datePosted === '7d'} onChange={() => setDatePosted('7d')} /> Last 7 days</label>
                    <label className="jobs-dropdown-item"><input type="radio" name="date" checked={datePosted === '30d'} onChange={() => setDatePosted('30d')} /> Last 30 days</label>
                  </div>
                )}
              </div>

              {/* Not Applied toggle */}
              <button className={`jobs-filter-pill ${selectedFilter.includes('Not Applied') ? 'active' : ''}`} onClick={() => setSelectedFilter(prev => prev.includes('Not Applied') ? prev.filter(x => x !== 'Not Applied') : [...prev, 'Not Applied'])} aria-pressed={selectedFilter.includes('Not Applied')}>Not Applied</button>

              {/* Exclusive Offers toggle */}
              <button className={`jobs-filter-pill ${selectedFilter.includes('Exclusive Offers') ? 'active' : ''}`} onClick={() => setSelectedFilter(prev => prev.includes('Exclusive Offers') ? prev.filter(x => x !== 'Exclusive Offers') : [...prev, 'Exclusive Offers'])} aria-pressed={selectedFilter.includes('Exclusive Offers')}>Exclusive Offers</button>
            </div>
            <div className="filters-right">
              <button className="jobs-clear" onClick={() => { setSelectedFilter([]); setSelectedJobTypes([]); setRemoteOption(null); setDatePosted(null); }}>Clear filters</button>
            </div>
          </div>
        </div>

        <div className="jobs-columns">
          {/* left list */}
          <div className="jobs-left">
            <div className="jobs-left-list">
              {filtered.length === 0 ? (
                <div className="no-jobs">No jobs match your filters.</div>
              ) : (
                filtered.map(job => (
                  <div key={job.id || job._id} onClick={() => setSelected(job)} className={`jobs-list-item ${(selected && (selected.id || selected._id)) === (job.id || job._id) ? 'active' : ''}`}>
                    <div className="jobs-list-top">
                      <div className="jobs-list-title">{job.title}</div>
                      <div className="job-type-pill">{job.type}</div>
                    </div>
                    <div className="job-company">{job.company} · {job.location}</div>
                    <div className="job-summary">{job.summary}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* right detail */}
          <div className="jobs-right">
            {selected ? (
              <>
                <div className="job-detail-top">
                  <div className="job-detail-left">
                    <div className="job-logo">
                      {selected.logoUrl ? (
                        <img src={selected.logoUrl} alt={selected.company} className="job-logo-img" />
                      ) : (
                        <div className="job-logo-fallback">{selected.logoName ? selected.logoName.split('.')[0] : selected.company ? selected.company.split(' ')[0] : 'Logo'}</div>
                      )}
                    </div>
                    <div className="job-main-meta">
                      <h2 className="job-title">{selected.title}</h2>
                      <div className="job-submeta">{selected.company} · {selected.location}</div>
                      {selected.companyAbout && <div className="job-company-about">{selected.companyAbout}</div>}
                      {selected.summary && <div className="job-company-summary">{selected.summary}</div>}
                      <div className="job-tags">
                        {selected.type && <div className="job-tag">{selected.type}</div>}
                        {selected.isRemote && <div className="job-tag job-remote">Remote</div>}
                        {selected.isHybrid && <div className="job-tag job-hybrid">Hybrid</div>}
                        {selected.exclusive && <div className="job-tag job-exclusive">Exclusive</div>}
                        {selected.postedAt && <div className="job-posted">• Posted {new Date(selected.postedAt).toLocaleDateString()}</div>}
                        {formatSalary(selected) && <div className="job-salary-inline">{formatSalary(selected)}</div>}
                      </div>
                    </div>
                  </div>
                  <div className="job-detail-right">
                    <div className="job-salary">{formatSalary(selected) || (selected.currency || selected.minSalary || selected.maxSalary ? `${selected.currency ? selected.currency + ' ' : ''}${selected.minSalary || ''}${selected.minSalary && selected.maxSalary ? ' - ' : ''}${selected.maxSalary || ''}${selected.salaryFrequency === 'hourly' ? '/hr' : '/yr'}` : '')}</div>
                    <div className="job-actions">
                      <button className="wc-btn wc-btn-primary" onClick={() => setShowApply(true)}>Apply</button>
                      <button
                        className={`wc-btn wc-btn-outline jobs-save-btn ${savedJobs.includes(selected?.id || selected?._id) ? 'saved' : ''}`}
                        title={savedJobs.includes(selected?.id || selected?._id) ? 'Saved' : 'Save job'}
                        onClick={() => toggleSave(selected)}
                        aria-pressed={savedJobs.includes(selected?.id || selected?._id)}
                      >
                        {/* bookmark icon */}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                          <path d="M6 2h12v18l-6-3-6 3V2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={savedJobs.includes(selected?.id || selected?._id) ? 'currentColor' : 'none'} />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="jobs-right-scroll">
                  <hr className="job-divider" />
                  <h4>Job Description</h4>
                  {/* Expand/collapse and optional sanitized HTML rendering */}
                  {(() => {
                    const raw = selected.description || selected.content || selected.longDescription || '';
                    const htmlRaw = selected.descriptionHtml || selected.html || '';
                    const LONG_LIMIT = 600;
                    return (
                      <DescriptionBlock
                        raw={raw}
                        htmlRaw={htmlRaw}
                        longLimit={LONG_LIMIT}
                      />
                    );
                  })()}

                  {/* Employer-provided structured fields */}
                  {selected.responsibilities && selected.responsibilities.length > 0 && (
                    <>
                      <h4 className="section-heading">Responsibilities</h4>
                      <ul>
                        {selected.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </>
                  )}

                  {selected.requirements && selected.requirements.length > 0 && (
                    <>
                      <h4 className="section-heading">Requirements</h4>
                      <ul>
                        {selected.requirements.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </>
                  )}

                  {selected.qualifications && selected.qualifications.length > 0 && (
                    <>
                      <h4 className="section-heading">Qualifications</h4>
                      <ul>
                        {selected.qualifications.map((q, i) => <li key={i}>{q}</li>)}
                      </ul>
                    </>
                  )}

                  {selected.benefits && selected.benefits.length > 0 && (
                    <>
                      <h4 className="section-heading">Benefits</h4>
                      <ul>
                        {selected.benefits.map((b, i) => <li key={i}>{b}</li>)}
                      </ul>
                    </>
                  )}

                  {selected.skills && selected.skills.length > 0 && (
                    <>
                      <h4 className="section-heading">Skills</h4>
                      <div className="skills-list">
                        {selected.skills.map((s, i) => <div key={i} className="skill-chip">{s}</div>)}
                      </div>
                    </>
                  )}

                  {/* How to apply / contact */}
                  {(selected.applyUrl || selected.applyEmail || selected.howToApply) && (
                    <>
                      <h4 className="section-heading">How to apply</h4>
                      <div className="how-to-apply">
                        {selected.howToApply || (selected.applyEmail ? <a href={`mailto:${selected.applyEmail}`}>{selected.applyEmail}</a> : null) || (selected.applyUrl ? <a href={selected.applyUrl} target="_blank" rel="noreferrer">Apply on company site</a> : null)}
                      </div>
                    </>
                  )}

                  {/* Optional sections if present on job object */}
                  {selected.requirements && selected.requirements.length > 0 && (
                    <>
                      <h4 className="section-heading">Requirements</h4>
                      <ul>
                        {selected.requirements.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </>
                  )}

                  {selected.responsibilities && selected.responsibilities.length > 0 && (
                    <>
                      <h4 className="section-heading">Responsibilities</h4>
                      <ul>
                        {selected.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </>
                  )}

                  {selected.benefits && selected.benefits.length > 0 && (
                    <>
                      <h4 className="section-heading">Benefits</h4>
                      <ul>
                        {selected.benefits.map((b, i) => <li key={i}>{b}</li>)}
                      </ul>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="no-selection">Select a job to view details</div>
            )}
          </div>
        </div>
      </div>

      {/* Apply modal */}
      {showApply && selected && (
        <div className="wc-modal-backdrop">
          <div className="wc-modal">
            <div className="modal-header">
              <h3>Apply for: {selected.title}</h3>
              <button onClick={() => setShowApply(false)} className="wc-btn wc-btn-outline">Close</button>
            </div>

            <div className="grid-form">
                <div>
                  <label htmlFor="applyFullName">Full name</label>
                  <input id="applyFullName" className="wc-input" value={applyFullName} onChange={e => setApplyFullName(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="applyEmail">Email address</label>
                  <input id="applyEmail" className="wc-input" value={applyEmail} onChange={e => setApplyEmail(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="applyContact">Contact number</label>
                  <input id="applyContact" className="wc-input" value={applyContact} onChange={e => setApplyContact(e.target.value)} />
                </div>
            
              <div className="full-row">
                <label htmlFor="resumeUrl">Resume / CV (link)</label>
                <input id="resumeUrl" className="wc-input" value={applyResumeUrl} onChange={e => setApplyResumeUrl(e.target.value)} placeholder="https://..." />
                <div style={{ marginTop: 8 }}>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--wc-muted)' }}>Or upload CV (optional)</label>
                  <input id="applyCvFile" className="wc-input" type="file" accept=".pdf,.doc,.docx" onChange={e => setApplyCvFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="coverLetter">Cover letter / short message</label>
                <textarea id="coverLetter" className="wc-input" value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
              </div>
            </div>

              <div className="modal-actions">
              <button className="wc-btn wc-btn-outline" onClick={() => setShowApply(false)}>Cancel</button>
              <button className="wc-btn wc-btn-primary" disabled={submitting} onClick={async () => {
                if (!profile) return alert('You must be logged in to apply');
                setSubmitting(true);
                try {
                  // gather values from controlled inputs
                  const fullName = applyFullName || getFullName(profile) || '';
                  const email = applyEmail || profile.email || '';
                  const contactNumber = applyContact || profile.phone || '';

                  // resume: prefer uploaded file, then resumeUrl state, then profile.resumeUrl
                  let resumeUrl = applyResumeUrl || profile.resumeUrl || '';
                  if (applyCvFile) {
                    try {
                      const fd = new FormData();
                      fd.append('file', applyCvFile);
                      const up = await fetch('/api/uploads/resume', { method: 'POST', body: fd });
                      if (up.ok) {
                        const j = await up.json();
                        resumeUrl = j.url || resumeUrl;
                      } else {
                        console.warn('Resume upload failed', await up.text());
                      }
                    } catch (e) {
                      console.warn('Resume upload error', e);
                    }
                  }

                  const payload = {
                    // applicantId: prefer top-level userId from auth context, fall back to profile ids
                    applicantId: userId || profile.userId || profile._id || profile.id || '',
                    // employerId is stored on job as `createdBy` on the backend; fall back to other common fields
                    employerId: selected.createdBy || selected.created_by || selected.employerId || selected.companyId || selected.postedBy || '',
                    jobId: (selected.id || selected._id || '') ,
                    jobTitle: selected.title,
                    fullName,
                    email,
                    contactNumber,
                    location: profile.city || profile.location || '',
                    profilePictureUrl: profile.avatar || profile.picture || '',
                    resumeUrl,
                    education: {
                      highestAttainment: (document.getElementById('eduAttainment') || {}).value || ''
                    },
                    workExperience: [{
                      jobTitle: (document.getElementById('weTitle') || {}).value || '',
                      company: (document.getElementById('weCompany') || {}).value || '',
                      startDate: (document.getElementById('weDates') || {}).value || '',
                      endDate: '',
                      responsibilities: (document.getElementById('weResponsibilities') || {}).value || ''
                    }],
                    skills: ((document.getElementById('skills') || {}).value || '').split(',').map(s => s.trim()).filter(Boolean),
                    coverLetter,
                    expectedSalary,
                    availability,
                    applicationDate: new Date().toISOString()
                  };

                  // If employerId is missing, try to resolve it by fetching the canonical job from the backend
                  if (!payload.employerId && payload.jobId) {
                    try {
                      const base = process.env.REACT_APP_API_BASE || '';
                      const jobsRes = await fetch(`${base}/api/jobs`);
                      if (jobsRes.ok) {
                        const jobsData = await jobsRes.json();
                        const found = (Array.isArray(jobsData) ? jobsData : (jobsData.jobs || [])).find(j => String(j._id || j.id) === String(payload.jobId));
                        if (found) {
                          payload.employerId = found.createdBy || found.created_by || payload.employerId || '';
                        }
                      }
                    } catch (e) {
                      // ignore backend lookup errors — we'll handle missing employer below
                    }
                  }

                  // validate required fields before sending to avoid 400 from server
                  if (!payload.applicantId || !payload.employerId || !payload.jobId) {
                    const missing = [];
                    if (!payload.applicantId) missing.push('applicantId');
                    if (!payload.employerId) missing.push('employerId');
                    if (!payload.jobId) missing.push('jobId');
                    // give a clearer error when employerId is missing
                    if (missing.length === 1 && missing[0] === 'employerId') {
                      throw new Error('This job does not have an associated employer on the server — cannot submit application.');
                    }
                    throw new Error('Missing required fields: ' + missing.join(', '));
                  }

                  await sendApplication(payload);
                  alert('Application submitted');
                  setShowApply(false);
                } catch (err) {
                  console.error(err);
                  // Try to show a helpful server error message when available
                  const msg = err && err.message ? err.message : String(err);
                  // server may return JSON text like { error: '...' } so attempt to parse
                  let friendly = msg;
                  try {
                    const j = JSON.parse(msg);
                    if (j && j.error) friendly = j.error;
                  } catch (e) {
                    // ignore parse errors
                  }
                  alert('Failed to submit application: ' + friendly);
                } finally { setSubmitting(false); }
              }}>Submit application</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Jobs;

