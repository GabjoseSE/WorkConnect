import React, { useState } from 'react';

export default function EmployerJobs() {
  const [form, setForm] = useState({
    title: '',
    category: '',
    type: '',
    status: '',
    summary: '',
    responsibilities: '',
    requirements: '',
    preferred: '',
    salary: '',
    benefits: '',
    location: '',
    workArrangement: 'remote',
    deadline: '',
    howToApply: ''
  });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ marginBottom: 8 }}>Job Posting</h1>

      <section style={{ marginTop: 18 }}>
        <h3>Job Basics</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          <input name="title" placeholder="Job Title" value={form.title} onChange={onChange} style={inputStyle} />
          <select name="category" value={form.category} onChange={onChange} style={inputStyle}>
            <option value="">Job Category</option>
            <option>Engineering</option>
            <option>Design</option>
            <option>Product</option>
          </select>
          <select name="type" value={form.type} onChange={onChange} style={inputStyle}>
            <option value="">Job Type</option>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
          </select>
          <select name="status" value={form.status} onChange={onChange} style={inputStyle}>
            <option value="">Employment Status</option>
            <option>Open</option>
            <option>Paused</option>
            <option>Closed</option>
          </select>
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>Job Description</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          <textarea name="summary" placeholder="Job Summary / Overview" value={form.summary} onChange={onChange} style={textareaStyle} />
          <textarea name="responsibilities" placeholder="Responsibilities / Duties" value={form.responsibilities} onChange={onChange} style={textareaStyle} />
          <textarea name="requirements" placeholder="Requirements / Qualifications" value={form.requirements} onChange={onChange} style={textareaStyle} />
          <input name="preferred" placeholder="Preferred Qualifications" value={form.preferred} onChange={onChange} style={inputStyle} />
        </div>
      </section>

      <section style={{ marginTop: 24, display: 'flex', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <h4>Compensation & Benefits</h4>
          <input name="salary" placeholder="Salary / Pay Range" value={form.salary} onChange={onChange} style={inputStyle} />
          <input name="benefits" placeholder="Benefits" value={form.benefits} onChange={onChange} style={inputStyle} />
        </div>

        <div style={{ flex: 1 }}>
          <h4>Location & Work Arrangement</h4>
          <input name="location" placeholder="Work Location" value={form.location} onChange={onChange} style={inputStyle} />
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 }}>
            <label style={radioLabel}><input type="radio" name="workArrangement" value="remote" checked={form.workArrangement === 'remote'} onChange={onChange} /> Remote</label>
            <label style={radioLabel}><input type="radio" name="workArrangement" value="onsite" checked={form.workArrangement === 'onsite'} onChange={onChange} /> On-site</label>
            <label style={radioLabel}><input type="radio" name="workArrangement" value="hybrid" checked={form.workArrangement === 'hybrid'} onChange={onChange} /> Hybrid</label>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h4>Application Details</h4>
        <input type="date" name="deadline" value={form.deadline} onChange={onChange} style={{ ...inputStyle, maxWidth: 360 }} />
        <input name="howToApply" placeholder="How to Apply" value={form.howToApply} onChange={onChange} style={inputStyle} />
      </section>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
        <button style={{ padding: '12px 20px', background: '#111827', color: '#fff', borderRadius: 8, border: 'none' }}>Post Job</button>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: '12px 14px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  fontSize: 14,
};

const textareaStyle = {
  minHeight: 88,
  padding: '12px 14px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  fontSize: 14,
  resize: 'vertical'
};

const radioLabel = { display: 'flex', gap: 8, alignItems: 'center', fontSize: 14 };
