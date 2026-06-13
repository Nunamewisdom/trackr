import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

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
  const { logout } = useAuth();
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
    <div style={styles.shell}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.brand}>Trackr</div>
        <a href="/" style={styles.navItem}>Dashboard</a>
        <a href="/applications" style={{ ...styles.navItem, ...styles.navActive }}>Applications</a>
        <a href="/companies" style={styles.navItem}>Companies</a>
        <a href="/interviews" style={styles.navItem}>Interviews</a>
        <a href="/reminders" style={styles.navItem}>Reminders</a>
        <button onClick={logout} style={styles.logoutBtn}>Logout</button>
      </div>

      {/* Main */}
      <div style={styles.main}>
        <div style={styles.topbar}>
          <h1 style={styles.title}>Applications</h1>
          <a href="/applications/new" style={styles.addBtn}>+ Add application</a>
        </div>

        {/* Filters */}
        <div style={styles.filters}>
          <input
            style={styles.search}
            type="text"
            placeholder="Search by role or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            style={styles.select}
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

        {/* Table */}
        {loading ? (
          <p>Loading...</p>
        ) : applications.length === 0 ? (
          <div style={styles.empty}>
            <p>No applications yet.</p>
            <a href="/applications/new" style={styles.addBtn}>Add your first one</a>
          </div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Company</th>
                  <th style={styles.th}>Location</th>
                  <th style={styles.th}>Applied</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} style={styles.tr}>
                    <td style={styles.td}>{app.job_title}</td>
                    <td style={styles.td}>{app.company_name || '—'}</td>
                    <td style={styles.td}>{app.location || '—'}</td>
                    <td style={styles.td}>
                      {app.applied_date
                        ? new Date(app.applied_date).toLocaleDateString()
                        : '—'}
                    </td>
                    <td style={styles.td}>
                      <select
                        style={{
                          ...styles.statusBadge,
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
                    <td style={styles.td}>
                      <button
                        style={styles.deleteBtn}
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
    borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '500',
  },
  filters: { display: 'flex', gap: '12px' },
  search: {
    padding: '8px 12px', border: '1px solid #ddd', borderRadius: '8px',
    fontSize: '14px', width: '300px', outline: 'none',
  },
  select: {
    padding: '8px 12px', border: '1px solid #ddd', borderRadius: '8px',
    fontSize: '14px', outline: 'none', background: 'white',
  },
  tableWrap: { background: 'white', borderRadius: '10px', border: '1px solid #eee', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '12px 16px', textAlign: 'left', fontSize: '12px',
    color: '#999', fontWeight: '500', borderBottom: '1px solid #eee',
    background: '#fafafa',
  },
  tr: { borderBottom: '1px solid #f5f5f5' },
  td: { padding: '12px 16px', fontSize: '14px', color: '#333' },
  statusBadge: {
    padding: '4px 10px', borderRadius: '20px', fontSize: '12px',
    fontWeight: '500', border: 'none', cursor: 'pointer',
  },
  deleteBtn: {
    background: 'none', border: 'none', color: '#999',
    fontSize: '13px', cursor: 'pointer',
  },
  empty: { textAlign: 'center', padding: '60px', color: '#999' },
};

export default Applications;

