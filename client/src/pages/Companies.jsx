import { useState, useEffect } from 'react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';

const Companies = () => {
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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5' }}>
      <Sidebar active="Companies" />

      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#222' }}>Companies</h1>
          <button
            style={{ background: '#534AB7', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ Add company'}
          </button>
        </div>

        {showForm && (
          <div style={{ background: 'white', padding: '24px', borderRadius: '10px', border: '1px solid #eee' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#222', marginBottom: '16px' }}>New Company</h2>
            {error && <div style={{ background: '#FCEBEB', color: '#791F1F', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                {[
                  { name: 'name', label: 'Company Name *', placeholder: 'Google', required: true },
                  { name: 'website', label: 'Website', placeholder: 'https://google.com' },
                  { name: 'industry', label: 'Industry', placeholder: 'Technology' },
                  { name: 'location', label: 'Location', placeholder: 'Remote / City' },
                ].map((field) => (
                  <div key={field.name} style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#333', marginBottom: '6px' }}>{field.label}</label>
                    <input
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                      type="text"
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#333', marginBottom: '6px' }}>Notes</label>
                <textarea
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', height: '80px', resize: 'vertical' }}
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Any notes about this company..."
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', color: '#555', background: 'white', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '10px 24px', background: '#534AB7', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                  Save Company
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : companies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
            <p>No companies yet.</p>
          </div>
        ) : (
          <div className="grid-2">
            {companies.map((company) => (
              <div key={company.id} style={{ background: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #eee', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#EEEDFE', color: '#534AB7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', flexShrink: 0 }}>
                  {company.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>{company.name}</div>
                  {company.industry && <div style={{ fontSize: '13px', color: '#777', marginBottom: '2px' }}>{company.industry}</div>}
                  {company.location && <div style={{ fontSize: '13px', color: '#777', marginBottom: '2px' }}>📍 {company.location}</div>}
                  {company.website && <div style={{ fontSize: '13px', color: '#777' }}>🌐 {company.website}</div>}
                </div>
                <button onClick={() => handleDelete(company.id)} style={{ background: 'none', border: 'none', color: '#ccc', fontSize: '13px', cursor: 'pointer' }}>
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

export default Companies;