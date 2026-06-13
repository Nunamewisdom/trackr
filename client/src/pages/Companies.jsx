import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Companies = () => {
  const { logout } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', website: '', industry: '', location: '', notes: '',
  });

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/companies');
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/companies', form);
      setForm({ name: '', website: '', industry: '', location: '', notes: '' });
      setShowForm(false);
      fetchCompanies();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add company');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this company?')) return;
    try {
      await api.delete(`/companies/${id}`);
      fetchCompanies();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={styles.shell}>
      <div style={styles.sidebar}>
        <div style={styles.brand}>Trackr</div>
        <a href="/" style={styles.navItem}>Dashboard</a>
        <a href="/applications" style={styles.navItem}>Applications</a>
        <a href="/companies" style={{ ...styles.navItem, ...styles.navActive }}>Companies</a>
        <a href="/interviews" style={styles.navItem}>Interviews</a>
         <a href="/reminders" style={styles.navItem}>Reminders</a>
        <button onClick={logout} style={styles.logoutBtn}>Logout</button>
      </div>

      <div style={styles.main}>
        <div style={styles.topbar}>
          <h1 style={styles.title}>Companies</h1>
          <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add company'}
          </button>
        </div>

        {showForm && (
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>New Company</h2>
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={styles.grid}>
                <div style={styles.field}>
                  <label style={styles.label}>Company Name *</label>
                  <input
                    style={styles.input}
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Google"
                    required
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Website</label>
                  <input
                    style={styles.input}
                    type="text"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="https://google.com"
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Industry</label>
                  <input
                    style={styles.input}
                    type="text"
                    name="industry"
                    value={form.industry}
                    onChange={handleChange}
                    placeholder="Technology"
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Location</label>
                  <input
                    style={styles.input}
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Remote / City"
                  />
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Notes</label>
                <textarea
                  style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Any notes about this company..."
                />
              </div>
              <div style={styles.actions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn}>
                  Save Company
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : companies.length === 0 ? (
          <div style={styles.empty}>
            <p>No companies yet.</p>
            <button style={styles.addBtn} onClick={() => setShowForm(true)}>
              Add your first company
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {companies.map((company) => (
              <div key={company.id} style={styles.companyCard}>
                <div style={styles.companyLogo}>
                  {company.name.charAt(0).toUpperCase()}
                </div>
                <div style={styles.companyInfo}>
                  <div style={styles.companyName}>{company.name}</div>
                  {company.industry && (
                    <div style={styles.companyMeta}>{company.industry}</div>
                  )}
                  {company.location && (
                    <div style={styles.companyMeta}>📍 {company.location}</div>
                  )}
                  {company.website && (
                    <div style={styles.companyMeta}>
                      🌐 {company.website}
                    </div>
                  )}
                </div>
                <button
                  style={styles.deleteBtn}
                  onClick={() => handleDelete(company.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  shell: { display: 'flex', minHeight: '100vh', background: '#f5f5f5' },
  sidebar: {
    width: '200px', background: 'white', borderRight: '1px solid #eee',
    padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '4px',
  },
  brand: {
    padding: '0 20px 20px', fontWeight: '700', fontSize: '20px',
    color: '#534AB7', borderBottom: '1px solid #eee', marginBottom: '8px',
  },
  navItem: {
    padding: '10px 20px', fontSize: '14px', color: '#555',
    textDecoration: 'none', display: 'block',
  },
  navActive: { background: '#EEEDFE', color: '#534AB7', fontWeight: '500' },
  logoutBtn: {
    marginTop: 'auto', padding: '10px 20px', background: 'none',
    border: 'none', color: '#999', fontSize: '14px', cursor: 'pointer',
    textAlign: 'left',
  },
  main: { flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' },
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '20px', fontWeight: '600', color: '#222' },
  addBtn: {
    background: '#534AB7', color: 'white', padding: '8px 16px',
    borderRadius: '8px', border: 'none', fontSize: '14px',
    fontWeight: '500', cursor: 'pointer',
  },
  formCard: {
    background: 'white', padding: '24px', borderRadius: '10px', border: '1px solid #eee',
  },
  formTitle: { fontSize: '16px', fontWeight: '600', color: '#222', marginBottom: '16px' },
  error: {
    background: '#FCEBEB', color: '#791F1F', padding: '10px 14px',
    borderRadius: '8px', marginBottom: '16px', fontSize: '14px',
  },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { marginBottom: '16px' },
  label: {
    display: 'block', fontSize: '13px', fontWeight: '500',
    color: '#333', marginBottom: '6px',
  },
  input: {
    width: '100%', padding: '10px 12px', border: '1px solid #ddd',
    borderRadius: '8px', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', background: 'white',
  },
  actions: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
  cancelBtn: {
    padding: '10px 20px', border: '1px solid #ddd', borderRadius: '8px',
    fontSize: '14px', color: '#555', background: 'white', cursor: 'pointer',
  },
  submitBtn: {
    padding: '10px 24px', background: '#534AB7', color: 'white',
    border: 'none', borderRadius: '8px', fontSize: '14px',
    fontWeight: '500', cursor: 'pointer',
  },
  companyCard: {
    background: 'white', padding: '20px', borderRadius: '10px',
    border: '1px solid #eee', display: 'flex', alignItems: 'flex-start', gap: '16px',
  },
  companyLogo: {
    width: '44px', height: '44px', borderRadius: '10px', background: '#EEEDFE',
    color: '#534AB7', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px', fontWeight: '700', flexShrink: 0,
  },
  companyInfo: { flex: 1 },
  companyName: { fontSize: '15px', fontWeight: '600', color: '#222', marginBottom: '4px' },
  companyMeta: { fontSize: '13px', color: '#777', marginBottom: '2px' },
  deleteBtn: {
    background: 'none', border: 'none', color: '#ccc',
    fontSize: '13px', cursor: 'pointer',
  },
  empty: { textAlign: 'center', padding: '60px', color: '#999' },
};

export default Companies;