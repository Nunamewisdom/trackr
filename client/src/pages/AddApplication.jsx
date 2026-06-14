import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';

const AddApplication = () => {
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

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: 'white' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5' }}>
      <Sidebar active="Applications" />

      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#222' }}>Add Application</h1>
          <a href="/applications" style={{ color: '#534AB7', textDecoration: 'none', fontSize: '14px' }}>← Back</a>
        </div>

        <div style={{ background: 'white', padding: '28px', borderRadius: '10px', border: '1px solid #eee' }}>
          {error && <div style={{ background: '#FCEBEB', color: '#791F1F', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#333', marginBottom: '6px' }}>Job Title *</label>
                <input style={inputStyle} type="text" name="job_title" value={form.job_title} onChange={handleChange} placeholder="Frontend Engineer" required />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#333', marginBottom: '6px' }}>Company</label>
                <select style={inputStyle} name="company_id" value={form.company_id} onChange={handleChange}>
                  <option value="">Select a company</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#333', marginBottom: '6px' }}>Job URL</label>
                <input style={inputStyle} type="url" name="job_url" value={form.job_url} onChange={handleChange} placeholder="https://..." />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#333', marginBottom: '6px' }}>Location</label>
                <input style={inputStyle} type="text" name="location" value={form.location} onChange={handleChange} placeholder="Remote / City" />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#333', marginBottom: '6px' }}>Salary Min</label>
                <input style={inputStyle} type="number" name="salary_min" value={form.salary_min} onChange={handleChange} placeholder="50000" />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#333', marginBottom: '6px' }}>Salary Max</label>
                <input style={inputStyle} type="number" name="salary_max" value={form.salary_max} onChange={handleChange} placeholder="80000" />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#333', marginBottom: '6px' }}>Status</label>
                <select style={inputStyle} name="status" value={form.status} onChange={handleChange}>
                  <option value="saved">Saved</option>
                  <option value="applied">Applied</option>
                  <option value="screening">Screening</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#333', marginBottom: '6px' }}>Applied Date</label>
                <input style={inputStyle} type="date" name="applied_date" value={form.applied_date} onChange={handleChange} />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', color: '#333', cursor: 'pointer' }}>
                <input type="checkbox" name="remote" checked={form.remote} onChange={handleChange} />
                {' '} Remote position
              </label>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#333', marginBottom: '6px' }}>Notes</label>
              <textarea style={{ ...inputStyle, height: '100px', resize: 'vertical' }} name="notes" value={form.notes} onChange={handleChange} placeholder="Any notes about this application..." />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <a href="/applications" style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', color: '#555', textDecoration: 'none' }}>Cancel</a>
              <button type="submit" disabled={loading} style={{ padding: '10px 24px', background: '#534AB7', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                {loading ? 'Saving...' : 'Save Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddApplication;