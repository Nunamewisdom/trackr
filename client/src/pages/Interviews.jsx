import { useState, useEffect } from 'react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';

const interviewTypes = [
  'phone_screen', 'technical', 'behavioral',
  'system_design', 'take_home', 'final_round', 'other'
];

const Interviews = () => {
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

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/interviews', form);
      setForm({ application_id: '', interview_type: 'technical', scheduled_at: '', duration_mins: 60, location: '', interviewer: '', prep_notes: '' });
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

  const formatDate = (dateStr) => new Date(dateStr).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const isUpcoming = (dateStr) => new Date(dateStr) > new Date();

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: 'white' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5' }}>
      <Sidebar active="Interviews" />

      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#222' }}>Interviews</h1>
          <button
            style={{ background: '#534AB7', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ Schedule interview'}
          </button>
        </div>

        {showForm && (
          <div style={{ background: 'white', padding: '24px', borderRadius: '10px', border: '1px solid #eee' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#222', marginBottom: '16px' }}>Schedule Interview</h2>
            {error && <div style={{ background: '#FCEBEB', color: '#791F1F', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#333', marginBottom: '6px' }}>Application *</label>
                  <select style={inputStyle} name="application_id" value={form.application_id} onChange={handleChange} required>
                    <option value="">Select application</option>
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>{app.job_title} {app.company_name ? `— ${app.company_name}` : ''}</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#333', marginBottom: '6px' }}>Interview Type</label>
                  <select style={inputStyle} name="interview_type" value={form.interview_type} onChange={handleChange}>
                    {interviewTypes.map((t) => (
                      <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#333', marginBottom: '6px' }}>Date and Time *</label>
                  <input style={inputStyle} type="datetime-local" name="scheduled_at" value={form.scheduled_at} onChange={handleChange} required />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#333', marginBottom: '6px' }}>Duration (minutes)</label>
                  <input style={inputStyle} type="number" name="duration_mins" value={form.duration_mins} onChange={handleChange} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#333', marginBottom: '6px' }}>Location / Video Link</label>
                  <input style={inputStyle} type="text" name="location" value={form.location} onChange={handleChange} placeholder="Zoom link or office address" />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#333', marginBottom: '6px' }}>Interviewer Name</label>
                  <input style={inputStyle} type="text" name="interviewer" value={form.interviewer} onChange={handleChange} placeholder="John Smith" />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#333', marginBottom: '6px' }}>Prep Notes</label>
                <textarea style={{ ...inputStyle, height: '80px', resize: 'vertical' }} name="prep_notes" value={form.prep_notes} onChange={handleChange} placeholder="Topics to review..." />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', color: '#555', background: 'white', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', background: '#534AB7', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Save Interview</button>
              </div>
            </form>
          </div>
        )}

        {loading ? <p>Loading...</p> : interviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
            <p>No interviews scheduled yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {interviews.map((interview) => (
              <div key={interview.id} style={{ background: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #eee', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', marginTop: '6px', flexShrink: 0, background: isUpcoming(interview.scheduled_at) ? '#534AB7' : '#ccc' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>
                    {interview.job_title}
                    {interview.company_name && <span style={{ fontWeight: '400', color: '#777' }}> — {interview.company_name}</span>}
                  </div>
                  <div style={{ fontSize: '13px', color: '#777', marginBottom: '2px' }}>
                    {interview.interview_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} · {formatDate(interview.scheduled_at)} · {interview.duration_mins} mins
                  </div>
                  {interview.location && <div style={{ fontSize: '13px', color: '#777' }}>📍 {interview.location}</div>}
                  {interview.interviewer && <div style={{ fontSize: '13px', color: '#777' }}>👤 {interview.interviewer}</div>}
                  {interview.prep_notes && <div style={{ fontSize: '13px', color: '#555', marginTop: '8px', background: '#f9f9f9', padding: '8px 10px', borderRadius: '6px' }}>📝 {interview.prep_notes}</div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: isUpcoming(interview.scheduled_at) ? '#EEEDFE' : '#f0f0f0', color: isUpcoming(interview.scheduled_at) ? '#534AB7' : '#999' }}>
                    {isUpcoming(interview.scheduled_at) ? 'Upcoming' : 'Past'}
                  </span>
                  <button onClick={() => handleDelete(interview.id)} style={{ background: 'none', border: 'none', color: '#ccc', fontSize: '13px', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Interviews;