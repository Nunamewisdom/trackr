import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const AddApplication = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    company_id: '',
    job_title: '',
    job_url: '',
    location: '',
    salary_min: '',
    salary_max: '',
    remote: false,
    status: 'applied',
    applied_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get('/companies');
        setCompanies(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCompanies();
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/applications', {
        ...form,
        salary_min: form.salary_min ? parseInt(form.salary_min) : null,
        salary_max: form.salary_max ? parseInt(form.salary_max) : null,
        company_id: form.company_id || null,
      });
      navigate('/applications');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.shell}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.brand}>Trackr</div>
        <a href="/" style={styles.navItem}>Dashboard</a>
        <a href="/applications" style={styles.navItem}>Applications</a>
        <a href="/companies" style={styles.navItem}>Companies</a>
        <button onClick={logout} style={styles.logoutBtn}>Logout</button>
      </div>

      {/* Main */}
      <div style={styles.main}>
        <div style={styles.topbar}>
          <h1 style={styles.title}>Add Application</h1>
          <a href="/applications" style={styles.backBtn}>← Back</a>
        </div>

        <div style={styles.formCard}>
          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>Job Title *</label>
                <input
                  style={styles.input}
                  type="text"
                  name="job_title"
                  value={form.job_title}
                  onChange={handleChange}
                  placeholder="Frontend Engineer"
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Company</label>
                <select
                  style={styles.input}
                  name="company_id"
                  value={form.company_id}
                  onChange={handleChange}
                >
                  <option value="">Select a company</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Job URL</label>
                <input
                  style={styles.input}
                  type="url"
                  name="job_url"
                  value={form.job_url}
                  onChange={handleChange}
                  placeholder="https://..."
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

              <div style={styles.field}>
                <label style={styles.label}>Salary Min</label>
                <input
                  style={styles.input}
                  type="number"
                  name="salary_min"
                  value={form.salary_min}
                  onChange={handleChange}
                  placeholder="50000"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Salary Max</label>
                <input
                  style={styles.input}
                  type="number"
                  name="salary_max"
                  value={form.salary_max}
                  onChange={handleChange}
                  placeholder="80000"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Status</label>
                <select
                  style={styles.input}
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="saved">Saved</option>
                  <option value="applied">Applied</option>
                  <option value="screening">Screening</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Applied Date</label>
                <input
                  style={styles.input}
                  type="date"
                  name="applied_date"
                  value={form.applied_date}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="remote"
                  checked={form.remote}
                  onChange={handleChange}
                />
                {' '} Remote position
              </label>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Notes</label>
              <textarea
                style={{ ...styles.input, height: '100px', resize: 'vertical' }}
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Any notes about this application..."
              />
            </div>

            <div style={styles.actions}>
              <a href="/applications" style={styles.cancelBtn}>Cancel</a>
              <button style={styles.submitBtn} type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Application'}
              </button>
            </div>
          </form>
        </div>
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
  logoutBtn: {
    marginTop: 'auto', padding: '10px 20px', background: 'none',
    border: 'none', color: '#999', fontSize: '14px', cursor: 'pointer',
    textAlign: 'left',
  },
  main: { flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' },
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '20px', fontWeight: '600', color: '#222' },
  backBtn: { color: '#534AB7', textDecoration: 'none', fontSize: '14px' },
  formCard: {
    background: 'white', padding: '28px', borderRadius: '10px', border: '1px solid #eee',
  },
  error: {
    background: '#FCEBEB', color: '#791F1F', padding: '10px 14px',
    borderRadius: '8px', marginBottom: '16px', fontSize: '14px',
  },
  grid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px',
  },
  field: { marginBottom: '16px' },
  label: {
    display: 'block', fontSize: '13px', fontWeight: '500',
    color: '#333', marginBottom: '6px',
  },
  checkboxLabel: { fontSize: '14px', color: '#333', cursor: 'pointer' },
  input: {
    width: '100%', padding: '10px 12px', border: '1px solid #ddd',
    borderRadius: '8px', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', background: 'white',
  },
  actions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' },
  cancelBtn: {
    padding: '10px 20px', border: '1px solid #ddd', borderRadius: '8px',
    fontSize: '14px', color: '#555', textDecoration: 'none',
  },
  submitBtn: {
    padding: '10px 24px', background: '#534AB7', color: 'white',
    border: 'none', borderRadius: '8px', fontSize: '14px',
    fontWeight: '500', cursor: 'pointer',
  },
};

export default AddApplication;