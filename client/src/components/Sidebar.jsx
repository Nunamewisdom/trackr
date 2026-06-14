import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ active }) => {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Applications', href: '/applications' },
    { label: 'Companies', href: '/companies' },
    { label: 'Interviews', href: '/interviews' },
    { label: 'Reminders', href: '/reminders' },
  ];

  const navigate = (href) => {
    setOpen(false);
    window.location.href = href;
  };

  return (
    <>
      <div className="mobile-bar">
        <span style={{ fontWeight: '700', fontSize: '18px', color: '#534AB7' }}>Trackr</span>
        <button
          style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#534AB7' }}
          onClick={() => setOpen(!open)}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && <div className="overlay" onClick={() => setOpen(false)} />}

      <div className={`sidebar ${open ? 'open' : ''}`}>
        <div style={{ padding: '0 20px 20px', fontWeight: '700', fontSize: '20px', color: '#534AB7', borderBottom: '1px solid #eee', marginBottom: '8px' }}>
          Trackr
        </div>
        {navItems.map((item) => (
          <button
            key={item.href}
            onClick={() => navigate(item.href)}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              textDecoration: 'none',
              display: 'block',
              width: '100%',
              textAlign: 'left',
              border: 'none',
              cursor: 'pointer',
              background: active === item.label ? '#EEEDFE' : 'none',
              color: active === item.label ? '#534AB7' : '#555',
              fontWeight: active === item.label ? '500' : '400',
            }}
          >
            {item.label}
          </button>
        ))}
        <button
          onClick={logout}
          style={{
            marginTop: 'auto', padding: '10px 20px',
            background: 'none', border: 'none',
            color: '#999', fontSize: '14px',
            cursor: 'pointer', textAlign: 'left',
          }}
        >
          Logout
        </button>
      </div>

      <div className="desktop-spacer" />
    </>
  );
};

export default Sidebar;