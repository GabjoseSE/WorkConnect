import React, { useState, useRef, useEffect } from 'react';
// If you install `flag-icon-css`, the CountrySelect will use its CSS classes
// for crisp flags (e.g. `flag-icon flag-icon-ph`). If not installed we fall
// back to emoji glyphs embedded in the country data.

const COUNTRIES = [
  { code: '+63', name: 'Philippines', flag: '🇵🇭', iso: 'ph' },
  { code: '+1', name: 'United States', flag: '🇺🇸', iso: 'us' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧', iso: 'gb' },
  { code: '+61', name: 'Australia', flag: '🇦🇺', iso: 'au' },
  { code: '+91', name: 'India', flag: '🇮🇳', iso: 'in' },
  { code: '+49', name: 'Germany', flag: '🇩🇪', iso: 'de' },
  { code: '+33', name: 'France', flag: '🇫🇷', iso: 'fr' },
  { code: '+34', name: 'Spain', flag: '🇪🇸', iso: 'es' },
  { code: '+39', name: 'Italy', flag: '🇮🇹', iso: 'it' },
  { code: '+81', name: 'Japan', flag: '🇯🇵', iso: 'jp' },
  { code: '+86', name: 'China', flag: '🇨🇳', iso: 'cn' },
];

function CountrySelect({ value, onChange, className, showCode = true }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef();

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const list = COUNTRIES.filter(c => (`${c.name} ${c.code}`).toLowerCase().includes(q.toLowerCase()));

  const current = COUNTRIES.find(c => c.code === value) || COUNTRIES[0];

  return (
    <div ref={ref} className={className} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(s => !s)} className="country-btn">
        {current.iso ? <span className={`flag-icon flag-icon-${current.iso}`} style={{ marginRight: 8 }} /> : <span style={{ marginRight: 8 }}>{current.flag}</span>}
        {showCode && <span style={{ marginRight: 8 }}>{current.code}</span>}
        <span style={{ opacity: 0.6 }}>{current.name}</span>
      </button>

      {open && (
        <div className="country-dropdown">
          <input className="wc-search country-search" placeholder="Search country or code" value={q} onChange={e => setQ(e.target.value)} />
          <ul className="country-list">
            {list.map(c => (
              <li key={c.code} className="country-item" onClick={() => { onChange(c.code); setOpen(false); }}>
                {c.iso ? <span className={`flag-icon flag-icon-${c.iso}`} style={{ marginRight: 8 }} /> : <span style={{ marginRight: 8 }}>{c.flag}</span>}
                {showCode && <strong style={{ marginRight: 8 }}>{c.code}</strong>}
                <span style={{ color: '#333' }}>{c.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CountrySelect;
