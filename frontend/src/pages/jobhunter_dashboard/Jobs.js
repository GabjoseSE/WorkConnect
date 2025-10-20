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
  const curr = job.currency || '';
  const freq = job.salaryFrequency === 'hourly' ? '/hr' : '/yr';
  if (min == null && max == null) return '';
  if (min != null && max != null) return `${curr ? curr + ' ' : ''}${min} - ${max}${freq}`;
  if (min != null) return `${curr ? curr + ' ' : ''}${min}${freq}`;
  return `${curr ? curr + ' ' : ''}${max}${freq}`;
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
          case 'Easy Apply': return !!job.easyApply;
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
    <div className="jobs-root page-content" style={{ padding: 20 }}>
    {/* normalize selected id for comparisons */}
    {null}
  <div className="jobs-inner" style={{ width: '100%', height: '100%' }}>
        {/* search */}
        <div className="jobs-search" style={{ marginBottom: 18 }}>
          <input className="wc-search jobs-search-input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search jobs, company or location" />
          <button className="wc-btn wc-btn-outline">Search</button>
        </div>

        {/* filters */}
  <div className="jobs-filters" style={{ marginBottom: 18 }} ref={filtersRef}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
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

              {/* Easy Apply toggle */}
              <button className={`jobs-filter-pill ${selectedFilter.includes('Easy Apply') ? 'active' : ''}`} onClick={() => setSelectedFilter(prev => prev.includes('Easy Apply') ? prev.filter(x => x !== 'Easy Apply') : [...prev, 'Easy Apply'])} aria-pressed={selectedFilter.includes('Easy Apply')}>Easy Apply</button>

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

            <div>
              <button className="jobs-clear" onClick={() => { setSelectedFilter([]); setSelectedJobTypes([]); setRemoteOption(null); setDatePosted(null); }}>Clear filters</button>
            </div>
          </div>
        </div>

        <div className="jobs-columns" style={{ display: 'flex', gap: 18, height: '100%' }}>
          {/* left list */}
          <div className="jobs-left" style={{ width: 320, background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column' }}>
            <div className="jobs-left-list" style={{ overflow: 'auto', minHeight: 0 }}>
              {filtered.length === 0 ? (
                <div style={{ padding: 24, color: '#777' }}>No jobs match your filters.</div>
              ) : (
                filtered.map(job => (
                  <div key={job.id || job._id} onClick={() => setSelected(job)} style={{ padding: 12, borderRadius: 6, cursor: 'pointer', background: (selected && (selected.id || selected._id)) === (job.id || job._id) ? '#f6fffa' : 'transparent', borderBottom: '1px solid #f3f3f3' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 700 }}>{job.title}</div>
                      <div style={{ fontSize: 12, color: '#0aa96f', border: '1px solid #e6f2ea', padding: '4px 8px', borderRadius: 6 }}>{job.type}</div>
                    </div>
                    <div style={{ color: '#666', fontSize: 13, marginTop: 6 }}>{job.company} · {job.location}</div>
                    <div style={{ color: '#444', marginTop: 8, fontSize: 13 }}>{job.summary}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* right detail */}
          <div className="jobs-right" style={{ flex: 1, background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 18, display: 'flex', flexDirection: 'column' }}>
            {selected ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 8, overflow: 'hidden', background: '#f3f3f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {selected.logoUrl ? (
                        <img src={selected.logoUrl} alt={selected.company} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ fontSize: 12, color: '#777', padding: 6, textAlign: 'center' }}>{selected.logoName ? selected.logoName.split('.')[0] : selected.company ? selected.company.split(' ')[0] : 'Logo'}</div>
                      )}
                    </div>
                    <div>
                      <h2 style={{ margin: 0 }}>{selected.title}</h2>
                      <div style={{ color: '#666', marginTop: 6 }}>{selected.company} · {selected.location}</div>
                      {selected.summary && <div style={{ marginTop: 8, color: '#444' }}>{selected.summary}</div>}
                      <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        {selected.type && <div style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, background: '#f3f7f6', border: '1px solid rgba(55,71,79,0.04)' }}>{selected.type}</div>}
                        {selected.isRemote && <div style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, background: '#eef7ff', border: '1px solid rgba(13,110,253,0.06)' }}>Remote</div>}
                        {selected.isHybrid && <div style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, background: '#fff7e6', border: '1px solid rgba(255,193,7,0.06)' }}>Hybrid</div>}
                        {selected.easyApply && <div style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, background: '#f3fff7', border: '1px solid rgba(10,169,111,0.06)' }}>Easy Apply</div>}
                        {selected.exclusive && <div style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, background: '#fff0f6', border: '1px solid rgba(244,63,94,0.06)' }}>Exclusive</div>}
                        {selected.postedAt && <div style={{ fontSize: 12, color: '#777' }}>• Posted {new Date(selected.postedAt).toLocaleDateString()}</div>}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: '#333' }}>{formatSalary(selected) || (selected.currency || selected.minSalary || selected.maxSalary ? `${selected.currency ? selected.currency + ' ' : ''}${selected.minSalary || ''}${selected.minSalary && selected.maxSalary ? ' - ' : ''}${selected.maxSalary || ''}${selected.salaryFrequency === 'hourly' ? '/hr' : '/yr'}` : '')}</div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'center' }}>
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

                <div className="jobs-right-scroll" style={{ overflow: 'auto', minHeight: 0 }}>
                  <hr style={{ margin: '18px 0', border: 'none', borderTop: '1px solid #f3f3f3' }} />

                  <h4>Job Description</h4>
                  {/* Expand/collapse and optional sanitized HTML rendering */}
                  {(() => {
                    const raw = selected.description || selected.content || '';
                    const htmlRaw = selected.descriptionHtml || selected.html || '';
                    const LONG_LIMIT = 600;
                    const isLong = raw && raw.length > LONG_LIMIT;
                    const [showFull, setShowFull] = [undefined, undefined]; // placeholder for lint-less patch
                    return (
                      <DescriptionBlock
                        raw={raw}
                        htmlRaw={htmlRaw}
                        longLimit={LONG_LIMIT}
                      />
                    );
                  })()}

                  {/* Optional sections if present on job object */}
                  {selected.requirements && selected.requirements.length > 0 && (
                    <>
                      <h4 style={{ marginTop: 18 }}>Requirements</h4>
                      <ul>
                        {selected.requirements.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </>
                  )}

                  {selected.responsibilities && selected.responsibilities.length > 0 && (
                    <>
                      <h4 style={{ marginTop: 18 }}>Responsibilities</h4>
                      <ul>
                        {selected.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </>
                  )}

                  {selected.benefits && selected.benefits.length > 0 && (
                    <>
                      <h4 style={{ marginTop: 18 }}>Benefits</h4>
                      <ul>
                        {selected.benefits.map((b, i) => <li key={i}>{b}</li>)}
                      </ul>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div style={{ color: '#888' }}>Select a job to view details</div>
            )}
          </div>
        </div>
      </div>

      {/* Apply modal */}
      {showApply && selected && (
        <div className="wc-modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 2000 }}>
          <div className="wc-modal" style={{ width: 760, maxWidth: '95%', background: '#fff', borderRadius: 8, padding: 18, boxShadow: '0 10px 40px rgba(0,0,0,0.2)', boxSizing: 'border-box', maxHeight: 'calc(100vh - 64px)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>Apply for: {selected.title}</h3>
              <button onClick={() => setShowApply(false)} className="wc-btn wc-btn-outline">Close</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
            
              <div style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="resumeUrl">Resume / CV (link)</label>
                <input id="resumeUrl" className="wc-input" value={applyResumeUrl} onChange={e => setApplyResumeUrl(e.target.value)} placeholder="https://..." />
                <div style={{ marginTop: 8 }}>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--wc-muted)' }}>Or upload CV (optional)</label>
                  <input id="applyCvFile" className="wc-input" type="file" accept=".pdf,.doc,.docx" style={{ padding: 6, height: 'auto', marginTop: 6 }} onChange={e => setApplyCvFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="coverLetter">Cover letter / short message</label>
                <textarea id="coverLetter" className="wc-input" value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
              </div>
            </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
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

                  // validate required fields before sending to avoid 400 from server
                  if (!payload.applicantId || !payload.employerId || !payload.jobId) {
                    const missing = [];
                    if (!payload.applicantId) missing.push('applicantId');
                    if (!payload.employerId) missing.push('employerId');
                    if (!payload.jobId) missing.push('jobId');
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

