import { useState, useEffect } from 'react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';

const statusColors = {
  saved:     { bg: '#F0F0F0', color: '#555' },
  applied:   { bg: '#E6F1FB', color: '#0C447C' },
  screening: { bg: '#FEF3E2', color: '#854F0B' },
  interview: { bg: '#EEEDFE', color: '#3C3489' },
  offer:     { bg: '#EAF3DE', color: '#27500A' },
  accepted:  { bg: '#EAF3DE', color: '#27500A' },
  rejected:  { bg: '#FCEBEB', color: '#791F1F' },
  withdrawn: { bg: '#F0F0F0', color: '#555' },
};

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchApplications = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/applications', { params });
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [search, statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/applications/${id}`, { status: newStatus });
      fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    try {
      await api.delete(`/applications/${id}`);
      fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5' }}>
      <Sidebar active="Applications" />

      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#222' }}>Applications</h1>
          <a href="/applications/new" style={{ background: '#534AB7', color: 'white', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
            + Add application
          </a>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', flex: 1, minWidth: '200px', outline: 'none' }}
            type="text"
            placeholder="Search by role or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'white' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="saved">Saved</option>
            <option value="applied">Applied</option>
            <option value="screening">Screening</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
            <p>No applications yet.</p>
            <a href="/applications/new" style={{ background: '#534AB7', color: 'white', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '500', marginTop: '12px', display: 'inline-block' }}>
              Add your first one
            </a>
          </div>
        ) : (
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Role', 'Company', 'Location', 'Applied', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#999', fontWeight: '500', borderBottom: '1px solid #eee', background: '#fafafa' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#333' }}>{app.job_title}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#333' }}>{app.company_name || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#333' }}>{app.location || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#333' }}>
                      {app.applied_date ? new Date(app.applied_date).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <select
                        style={{
                          padding: '4px 10px', borderRadius: '20px', fontSize: '12px',
                          fontWeight: '500', border: 'none', cursor: 'pointer',
                          background: statusColors[app.status]?.bg,
                          color: statusColors[app.status]?.color,
                        }}
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      >
                        {Object.keys(statusColors).map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        style={{ background: 'none', border: 'none', color: '#999', fontSize: '13px', cursor: 'pointer' }}
                        onClick={() => handleDelete(app.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;