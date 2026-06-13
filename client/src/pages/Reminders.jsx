import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const reminderTypes = ['follow_up', 'offer_deadline', 'interview_prep', 'custom'];

const Reminders = () => {
  const { logout } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    application_id: '',
    title: '',
    reminder_type: 'custom',
    remind_at: '',
  });

  const fetchData = async () => {
    try {
      const [remindersRes, applicationsRes] = await Promise.all([
        api.get('/reminders'),
        api.get('/applications'),
      ]);
      setReminders(remindersRes.data);
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
      await api.post('/reminders', form);
      setForm({ application_id: '', title: '', reminder_type: 'custom', remind_at: '' });
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add reminder');
    }
  };

  const handleDismiss = async (id) => {
    try {
      await api.patch(`/reminders/${id}/dismiss`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reminder?')) return;
    try {
      await api.delete(`/reminders/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const isOverdue = (dateStr) => new Date(dateStr) < new Date();

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const typeColors = {
    follow_up:      { bg: '#E6F1FB', color: '#0C447C' },
    offer_deadline: { bg: '#FCEBEB', color: '#791F1F' },
    interview_prep: { bg: '#EEEDFE', color: '#3C3489' },
    custom:         { bg: '#F0F0F0', color: '#555' },
  };

  return (
    <div style={styles.shell}>
      <div style={styles.sidebar}>
        <div style={styles.brand}>Trackr</div>
        <a href="/" style={styles.navItem}>Dashboard</a>
        <a href="/applications" style={styles.navItem}>Applications</a>
        <a href="/companies" style={styles.navItem}>Companies</a>
        <a href="/interviews" style={styles.navItem}>Interviews</a>
        <a href="/reminders" style={{ ...styles.navItem, ...styles.navActive }}>Reminders</a>
        <button onClick={logout} style={styles.logoutBtn}>Logout</button>
      </div>

      <div style={styles.main}>
        <div style={styles.topbar}>
          <h1 style={styles.title}>Reminders</h1>
          <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add reminder'}
          </button>
        </div>

        {showForm && (
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>New Reminder</h2>
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={styles.grid}>
                <div style={styles.field}>
                  <label style={styles.label}>Title *</label>
                  <input
                    style={styles.input}
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Follow up with Google"
                    required
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Type</label>
                  <select
                    style={styles.input}
                    name="reminder_type"
                    value={form.reminder_type}
                    onChange={handleChange}
                  >
                    {reminderTypes.map((t) => (
                      <option key={t} value={t}>
                        {t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Remind At *</label>
                  <input
                    style={styles.input}
                    type="datetime-local"
                    name="remind_at"
                    value={form.remind_at}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Linked Application</label>
                  <select
                    style={styles.input}
                    name="application_id"
                    value={form.application_id}
                    onChange={handleChange}
                  >
                    <option value="">None</option>
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.job_title} {app.company_name ? `— ${app.company_name}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.actions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn}>
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : reminders.length === 0 ? (
          <div style={styles.empty}>
            <p>No reminders yet.</p>
            <button style={styles.addBtn} onClick={() => setShowForm(true)}>
              Add your first reminder
            </button>
          </div>
        ) : (
          <div style={styles.list}>
            {reminders.map((reminder) => (
              <div key={reminder.id} style={{
                ...styles.reminderCard,
                borderLeft: `3px solid ${isOverdue(reminder.remind_at) ? '#F7C1C1' : '#534AB7'}`,
              }}>
                <div style={styles.reminderInfo}>
                  <div style={styles.reminderTitle}>{reminder.title}</div>
                  {reminder.job_title && (
                    <div style={styles.reminderMeta}>
                      🔗 {reminder.job_title}
                      {reminder.company_name && ` — ${reminder.company_name}`}
                    </div>
                  )}
                  <div style={styles.reminderMeta}>
                    🕐 {formatDate(reminder.remind_at)}
                  </div>
                </div>
                <div style={styles.cardRight}>
                  <span style={{
                    ...styles.badge,
                    background: typeColors[reminder.reminder_type]?.bg,
                    color: typeColors[reminder.reminder_type]?.color,
                  }}>
                    {reminder.reminder_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  {isOverdue(reminder.remind_at) && (
                    <span style={styles.overdueBadge}>Overdue</span>
                  )}
                  <div style={styles.cardActions}>
                    <button style={styles.dismissBtn} onClick={() => handleDismiss(reminder.id)}>
                      Dismiss
                    </button>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(reminder.id)}>
                      Delete
                    </button>
                  </div>
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
  reminderCard: {
    background: 'white', padding: '20px', borderRadius: '10px',
    border: '1px solid #eee', display: 'flex', alignItems: 'flex-start',
    justifyContent: 'space-between', gap: '16px',
  },
  reminderInfo: { flex: 1 },
  reminderTitle: { fontSize: '15px', fontWeight: '600', color: '#222', marginBottom: '4px' },
  reminderMeta: { fontSize: '13px', color: '#777', marginBottom: '2px' },
  cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' },
  badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  overdueBadge: {
    padding: '4px 10px', borderRadius: '20px', fontSize: '12px',
    fontWeight: '500', background: '#FCEBEB', color: '#791F1F',
  },
  cardActions: { display: 'flex', gap: '8px' },
  dismissBtn: {
    background: 'none', border: '1px solid #ddd', borderRadius: '6px',
    color: '#555', fontSize: '12px', cursor: 'pointer', padding: '4px 10px',
  },
  deleteBtn: {
    background: 'none', border: 'none', color: '#ccc',
    fontSize: '13px', cursor: 'pointer',
  },
  empty: { textAlign: 'center', padding: '60px', color: '#999' },
};

export default Reminders;