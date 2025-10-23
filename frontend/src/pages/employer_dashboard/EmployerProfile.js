import React, { useEffect, useState } from 'react';
import './EmployerProfile.css';
import { useAuth } from '../../contexts/AuthContext';
import { getOwnProfile } from '../../api/profile';

export default function EmployerProfile() {
  const { token, userId, profile: authProfile } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // prefer profile from auth context if it matches
        if (authProfile && authProfile.userId && String(authProfile.userId) === String(userId)) {
          if (!cancelled) setCompany(authProfile);
        } else {
          const p = await getOwnProfile(token, userId, authProfile?.email);
          if (!cancelled) setCompany(p);
        }
      } catch (err) {
        if (!cancelled) setError('Failed to load company profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [token, userId, authProfile]);

  if (loading) return <div className="page-content" style={{ padding: 24 }}>Loading company profile…</div>;
  if (error) return <div className="page-content" style={{ padding: 24 }}><div className="signup-error">{error}</div></div>;

  if (!company) return <div className="page-content" style={{ padding: 24 }}>No company profile found.</div>;

  return (
    <div className="employer-profile page-content">
      <div className="profile-header">
        <div className="profile-title">
          <div className="logo-placeholder">{company?.companyLogo ? <img src={company.companyLogo} alt={company.companyName || 'Company'} /> : ((company?.companyName || 'Company').split(' ').map(w => w[0]).slice(0,2).join(''))}</div>
          <div>
            <h2 className="company-name">{company.companyName}</h2>
            <div className="company-meta">{company.industry || '—'} • {company.companySize || '—'}{company.founded ? ' • Founded ' + company.founded : ''}</div>
          </div>
        </div>
        <div>
          <button className="wc-btn wc-btn-primary">Edit Profile</button>
        </div>
      </div>

      <div className="profile-grid">
        <section className="profile-left card">
          <h3>Basic Information</h3>
          <dl className="info-list">
            <dt>Company Name</dt><dd>{company.companyName || '—'}</dd>
            <dt>Industry / Type</dt><dd>{company.industry || '—'}</dd>
            <dt>Company Size</dt><dd>{company.companySize || '—'}</dd>
            <dt>Founded</dt><dd>{company.founded || '—'}</dd>
            <dt>Headquarters</dt><dd>{company.companyLocation || '—'}</dd>
            <dt>Website</dt><dd>{company.companyWebsite ? (<a href={company.companyWebsite} target="_blank" rel="noreferrer">{company.companyWebsite}</a>) : '—'}</dd>
          </dl>

          <h4>Contact Information</h4>
          <dl className="info-list">
            <dt>Company Email</dt><dd>{company.ownerEmail || company.email || '—'}</dd>
            <dt>Phone Number</dt><dd>{company.ownerPhone || company.phone || '—'}</dd>
            <dt>Address</dt><dd>{company.companyLocation || '—'}</dd>
          </dl>
        </section>

        <section className="profile-right card">

          <h3>Company Description</h3>
          <p className="company-desc">{company.companyDescription || 'No description provided.'}</p>

          <h4>Mission & Vision</h4>
          <p className="company-mission">{company.mission || 'Not provided.'}</p>

          <h4>Core Values</h4>
          <p className="company-values">{(company.coreValues && company.coreValues.length) ? company.coreValues.join(', ') : (company.values || 'Not provided.')}</p>

          <h4>Gallery / Media</h4>
          <div className="gallery">
            {(!company.gallery || company.gallery.length === 0) ? (
              <div className="gallery-empty">No media uploaded yet.</div>
            ) : (
              (company.gallery || []).map((g,i) => <img key={i} src={g} alt={`media-${i}`} />)
            )}
          </div>

          <h4>Reviews</h4>
          <div className="reviews">No reviews yet.</div>
        </section>
      </div>
    </div>
  );
}
