import React, { useState, useRef, useEffect } from "react";
import './Jobs.css';
import { useJobs } from '../../contexts/JobsContext';
import { useAuth } from '../../contexts/AuthContext';
import { sendApplication } from '../../api/applications';

function Jobs() {
  const { jobs, savedJobs, toggleSave } = useJobs();
  const [selected, setSelected] = useState(jobs[0]);
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [remoteOption, setRemoteOption] = useState(null); // 'Remote' | 'On-site' | 'Hybrid'
  const [datePosted, setDatePosted] = useState(null); // '24h' | '7d' | '30d'
  const [openDropdown, setOpenDropdown] = useState(null);
  const filtersRef = useRef(null);
  const { profile } = useAuth();

  // apply modal state
  const [showApply, setShowApply] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [availability, setAvailability] = useState('Full-time');
  const [submitting, setSubmitting] = useState(false);

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
    <div style={{ padding: 20 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* search */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18 }}>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search jobs, company or location" style={{ flex: 1, padding: '10px 12px', borderRadius: 6, border: '1px solid #e7e7e7' }} />
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

        <div style={{ display: 'flex', gap: 18 }}>
          {/* left list */}
          <div style={{ width: 320, background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 24, color: '#777' }}>No jobs match your filters.</div>
            ) : (
              filtered.map(job => (
                <div key={job.id} onClick={() => setSelected(job)} style={{ padding: 12, borderRadius: 6, cursor: 'pointer', background: selected?.id === job.id ? '#f6fffa' : 'transparent', borderBottom: '1px solid #f3f3f3' }}>
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

          {/* right detail */}
          <div style={{ flex: 1, background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 18 }}>
            {selected ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div>
                    <h2 style={{ margin: 0 }}>{selected.title}</h2>
                    <div style={{ color: '#666', marginTop: 6 }}>{selected.company} · {selected.location}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: '#333' }}>{selected.salary || (selected.minSalary || selected.maxSalary ? `${selected.currency ? selected.currency + ' ' : ''}${selected.minSalary || ''}${selected.minSalary && selected.maxSalary ? ' - ' : ''}${selected.maxSalary || ''}${selected.salaryFrequency === 'hourly' ? '/hr' : '/yr'}` : '')}</div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'center' }}>
                      <button className="wc-btn wc-btn-primary" onClick={() => setShowApply(true)}>Apply</button>
                      <button
                        className={`wc-btn wc-btn-ghost jobs-save-btn ${savedJobs.includes(selected.id) ? 'saved' : ''}`}
                        title={savedJobs.includes(selected.id) ? 'Saved' : 'Save job'}
                        onClick={() => toggleSave(selected)}
                        aria-pressed={savedJobs.includes(selected.id)}
                        style={{ marginTop: 10 }}
                      >
                        {/* bookmark icon */}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                          <path d="M6 2h12v18l-6-3-6 3V2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={savedJobs.includes(selected.id) ? 'currentColor' : 'none'} />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <hr style={{ margin: '18px 0', border: 'none', borderTop: '1px solid #f3f3f3' }} />

                <h4>Job Description</h4>
                <p style={{ color: '#444' }}>{selected.description}</p>

                <h4>Requirements</h4>
                <ul>
                  <li>Relevant experience</li>
                  <li>Good communication</li>
                </ul>
              </>
            ) : (
              <div style={{ color: '#888' }}>Select a job to view details</div>
            )}
          </div>
        </div>
      </div>

      {/* Apply modal */}
      {showApply && selected && (
        <div className="wc-modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className="wc-modal" style={{ width: 760, maxWidth: '95%', background: '#fff', borderRadius: 8, padding: 18, boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>Apply for: {selected.title}</h3>
              <button onClick={() => setShowApply(false)} className="wc-btn wc-btn-ghost">Close</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label>Full name</label>
                <input value={profile?.fullName || profile?.name || ''} onChange={() => {}} readOnly style={{ width: '100%', padding: 8, marginTop: 6 }} />
              </div>
              <div>
                <label>Email address</label>
                <input value={profile?.email || ''} readOnly style={{ width: '100%', padding: 8, marginTop: 6 }} />
              </div>
              <div>
                <label>Contact number</label>
                <input value={profile?.phone || ''} readOnly style={{ width: '100%', padding: 8, marginTop: 6 }} />
              </div>
              <div>
                <label>Location</label>
                <input value={profile?.city || profile?.location || ''} readOnly style={{ width: '100%', padding: 8, marginTop: 6 }} />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label>Resume / CV (link)</label>
                <input id="resumeUrl" placeholder="https://..." style={{ width: '100%', padding: 8, marginTop: 6 }} />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label>Highest educational attainment</label>
                <input id="eduAttainment" placeholder="e.g. Bachelor's" style={{ width: '100%', padding: 8, marginTop: 6 }} />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label>Work experience (optional)</label>
                <input id="weTitle" placeholder="Job title" style={{ width: '100%', padding: 8, marginTop: 6 }} />
                <input id="weCompany" placeholder="Company" style={{ width: '100%', padding: 8, marginTop: 6 }} />
                <input id="weDates" placeholder="Dates (start - end)" style={{ width: '100%', padding: 8, marginTop: 6 }} />
                <input id="weResponsibilities" placeholder="Key responsibilities" style={{ width: '100%', padding: 8, marginTop: 6 }} />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label>Skills (comma separated)</label>
                <input id="skills" placeholder="React, Node.js, Figma" style={{ width: '100%', padding: 8, marginTop: 6 }} />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label>Cover letter / short message</label>
                <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} style={{ width: '100%', padding: 8, minHeight: 100, marginTop: 6 }} />
              </div>

              <div>
                <label>Expected salary</label>
                <input value={expectedSalary} onChange={e => setExpectedSalary(e.target.value)} placeholder="Optional" style={{ width: '100%', padding: 8, marginTop: 6 }} />
              </div>
              <div>
                <label>Availability</label>
                <select value={availability} onChange={e => setAvailability(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 6 }}>
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Remote</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
              <button className="wc-btn wc-btn-ghost" onClick={() => setShowApply(false)}>Cancel</button>
              <button className="wc-btn wc-btn-primary" onClick={async () => {
                if (!profile) return alert('You must be logged in to apply');
                setSubmitting(true);
                try {
                  const payload = {
                    applicantId: profile.userId || profile._id,
                    employerId: selected.employerId || selected.companyId || selected.postedBy || '',
                    jobId: selected.id || selected._id || '',
                    jobTitle: selected.title,
                    fullName: profile.fullName || profile.name || '',
                    email: profile.email || '',
                    contactNumber: profile.phone || '',
                    location: profile.city || profile.location || '',
                    profilePictureUrl: profile.avatar || profile.picture || '',
                    resumeUrl: (document.getElementById('resumeUrl') || {}).value || '',
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

                  await sendApplication(payload);
                  alert('Application submitted');
                  setShowApply(false);
                } catch (err) {
                  console.error(err);
                  alert('Failed to submit application');
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

