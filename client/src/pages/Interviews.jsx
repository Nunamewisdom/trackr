import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const interviewTypes = [
  'phone_screen', 'technical', 'behavioral',
  'system_design', 'take_home', 'final_round', 'other'
];

const Interviews = () => {
  const { logout } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    application_id: '',
    interview_type: 'technical',
    scheduled_at: '',
    duration_mins: 60,
    location: '',
    interviewer: '',
    prep_notes: '',
  });

  const fetchData = async () => {
    try {
      const [interviewsRes, applicationsRes] = await Promise.all([
        api.get('/interviews'),
        api.get('/applications'),
      ]);
      setInterviews(interviewsRes.data);
      setApplications(applicationsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/interviews', form);
      setForm({
        application_id: '',
        interview_type: 'technical',
        scheduled_at: '',
        duration_mins: 60,
        location: '',
        interviewer: '',
        prep_notes: '',
      });
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add interview');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this interview?')) return;
    try {
      await api.delete(`/interviews/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const isUpcoming = (dateStr) => new Date(dateStr) > new Date();

  return (
    <div style={styles.shell}>
      <div style={styles.sidebar}>
        <div style={styles.brand}>Trackr</div>
        <a href="/" style={styles.navItem}>Dashboard</a>
        <a href="/applications" style={styles.navItem}>Applications</a>
        <a href="/companies" style={styles.navItem}>Companies</a>
        <a href="/interviews" style={{ ...styles.navItem, ...styles.navActive }}>Interviews</a>
        <a href="/reminders" style={styles.navItem}>Reminders</a>
        <button onClick={logout} style={styles.logoutBtn}>Logout</button>
      </div>

      <div style={styles.main}>
        <div style={styles.topbar}>
          <h1 style={styles.title}>Interviews</h1>
          <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Schedule interview'}
          </button>
        </div>

        {showForm && (
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Schedule Interview</h2>
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={styles.grid}>
                <div style={styles.field}>
                  <label style={styles.label}>Application *</label>
                  <select
                    style={styles.input}
                    name="application_id"
                    value={form.application_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select application</option>
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.job_title} {app.company_name ? `— ${app.company_name}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Interview Type</label>
                  <select
                    style={styles.input}
                    name="interview_type"
                    value={form.interview_type}
                    onChange={handleChange}
                  >
                    {interviewTypes.map((t) => (
                      <option key={t} value={t}>
                        {t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Date and Time *</label>
                  <input
                    style={styles.input}
                    type="datetime-local"
                    name="scheduled_at"
                    value={form.scheduled_at}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Duration (minutes)</label>
                  <input
                    style={styles.input}
                    type="number"
                    name="duration_mins"
                    value={form.duration_mins}
                    onChange={handleChange}
                    placeholder="60"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Location / Video Link</label>
                  <input
                    style={styles.input}
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Zoom link or office address"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Interviewer Name</label>
                  <input
                    style={styles.input}
                    type="text"
                    name="interviewer"
                    value={form.interviewer}
                    onChange={handleChange}
                    placeholder="John Smith"
                  />
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Prep Notes</label>
                <textarea
                  style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                  name="prep_notes"
                  value={form.prep_notes}
                  onChange={handleChange}
                  placeholder="Topics to review, questions to ask..."
                />
              </div>

              <div style={styles.actions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn}>
                  Save Interview
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : interviews.length === 0 ? (
          <div style={styles.empty}>
            <p>No interviews scheduled yet.</p>
            <button style={styles.addBtn} onClick={() => setShowForm(true)}>
              Schedule your first interview
            </button>
          </div>
        ) : (
          <div style={styles.list}>
            {interviews.map((interview) => (
              <div key={interview.id} style={styles.interviewCard}>
                <div style={{
                  ...styles.statusDot,
                  background: isUpcoming(interview.scheduled_at) ? '#534AB7' : '#ccc',
                }} />
                <div style={styles.interviewInfo}>
                  <div style={styles.interviewTitle}>
                    {interview.job_title}
                    {interview.company_name && (
                      <span style={styles.companyTag}> — {interview.company_name}</span>
                    )}
                  </div>
                  <div style={styles.interviewMeta}>
                    {interview.interview_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    {' · '}
                    {formatDate(interview.scheduled_at)}
                    {' · '}
                    {interview.duration_mins} mins
                  </div>
                  {interview.location && (
                    <div style={styles.interviewMeta}>📍 {interview.location}</div>
                  )}
                  {interview.interviewer && (
                    <div style={styles.interviewMeta}>👤 {interview.interviewer}</div>
                  )}
                  {interview.prep_notes && (
                    <div style={styles.prepNotes}>📝 {interview.prep_notes}</div>
                  )}
                </div>
                <div style={styles.cardRight}>
                  <span style={{
                    ...styles.badge,
                    background: isUpcoming(interview.scheduled_at) ? '#EEEDFE' : '#f0f0f0',
                    color: isUpcoming(interview.scheduled_at) ? '#534AB7' : '#999',
                  }}>
                    {isUpcoming(interview.scheduled_at) ? 'Upcoming' : 'Past'}
                  </span>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(interview.id)}
                  >
                    Delete
                  </button>
                </div>
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
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  interviewCard: {
    background: 'white', padding: '20px', borderRadius: '10px',
    border: '1px solid #eee', display: 'flex', alignItems: 'flex-start', gap: '16px',
  },
  statusDot: {
    width: '10px', height: '10px', borderRadius: '50%', marginTop: '6px', flexShrink: 0,
  },
  interviewInfo: { flex: 1 },
  interviewTitle: { fontSize: '15px', fontWeight: '600', color: '#222', marginBottom: '4px' },
  companyTag: { fontWeight: '400', color: '#777' },
  interviewMeta: { fontSize: '13px', color: '#777', marginBottom: '2px' },
  prepNotes: {
    fontSize: '13px', color: '#555', marginTop: '8px',
    background: '#f9f9f9', padding: '8px 10px', borderRadius: '6px',
  },
  cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' },
  badge: {
    padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500',
  },
  deleteBtn: {
    background: 'none', border: 'none', color: '#ccc',
    fontSize: '13px', cursor: 'pointer',
  },
  empty: { textAlign: 'center', padding: '60px', color: '#999' },
};

export default Interviews;