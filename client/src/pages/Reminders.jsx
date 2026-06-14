import { useState, useEffect } from 'react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';

const reminderTypes = ['follow_up', 'offer_deadline', 'interview_prep', 'custom'];

const typeColors = {
  follow_up:      { bg: '#E6F1FB', color: '#0C447C' },
  offer_deadline: { bg: '#FCEBEB', color: '#791F1F' },
  interview_prep: { bg: '#EEEDFE', color: '#3C3489' },
  custom:         { bg: '#F0F0F0', color: '#555' },
};

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    application_id: '', title: '', reminder_type: 'custom', remind_at: '',
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

  useEffect(() => { fetchData(); }, []);

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

  const formatDate = (dateStr) => new Date(dateStr).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: 'white' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5' }}>
      <Sidebar active="Reminders" />

      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#222' }}>Reminders</h1>
          <button
            style={{ background: '#534AB7', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ Add reminder'}
          </button>
        </div>

        {showForm && (
          <div style={{ background: 'white', padding: '24px', borderRadius: '10px', border: '1px solid #eee' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#222', marginBottom: '16px' }}>New Reminder</h2>
            {error && <div style={{ background: '#FCEBEB', color: '#791F1F', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#333', marginBottom: '6px' }}>Title *</label>
                  <input style={inputStyle} type="text" name="title" value={form.title} onChange={handleChange} placeholder="Follow up with Google" required />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#333', marginBottom: '6px' }}>Type</label>
                  <select style={inputStyle} name="reminder_type" value={form.reminder_type} onChange={handleChange}>
                    {reminderTypes.map((t) => (
                      <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#333', marginBottom: '6px' }}>Remind At *</label>
                  <input style={inputStyle} type="datetime-local" name="remind_at" value={form.remind_at} onChange={handleChange} required />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#333', marginBottom: '6px' }}>Linked Application</label>
                  <select style={inputStyle} name="application_id" value={form.application_id} onChange={handleChange}>
                    <option value="">None</option>
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>{app.job_title} {app.company_name ? `— ${app.company_name}` : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', color: '#555', background: 'white', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', background: '#534AB7', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Save Reminder</button>
              </div>
            </form>
          </div>
        )}

        {loading ? <p>Loading...</p> : reminders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
            <p>No reminders yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reminders.map((reminder) => (
              <div key={reminder.id} style={{ background: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #eee', borderLeft: `3px solid ${isOverdue(reminder.remind_at) ? '#F7C1C1' : '#534AB7'}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>{reminder.title}</div>
                  {reminder.job_title && (
                    <div style={{ fontSize: '13px', color: '#777', marginBottom: '2px' }}>
                      🔗 {reminder.job_title}{reminder.company_name && ` — ${reminder.company_name}`}
                    </div>
                  )}
                  <div style={{ fontSize: '13px', color: '#777' }}>🕐 {formatDate(reminder.remind_at)}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: typeColors[reminder.reminder_type]?.bg, color: typeColors[reminder.reminder_type]?.color }}>
                    {reminder.reminder_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  {isOverdue(reminder.remind_at) && (
                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: '#FCEBEB', color: '#791F1F' }}>Overdue</span>
                  )}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleDismiss(reminder.id)} style={{ background: 'none', border: '1px solid #ddd', borderRadius: '6px', color: '#555', fontSize: '12px', cursor: 'pointer', padding: '4px 10px' }}>Dismiss</button>
                    <button onClick={() => handleDelete(reminder.id)} style={{ background: 'none', border: 'none', color: '#ccc', fontSize: '13px', cursor: 'pointer' }}>Delete</button>
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

export default Reminders;