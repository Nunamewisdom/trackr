import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/analytics/summary');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div style={styles.loading}>Loading...</div>;

  const { byStatus = {}, totalApplied = 0, responseRate = 0, avgResponseDays, weeklyActivity = [] } = stats || {};

  const chartData = weeklyActivity.map((w) => ({
    week: new Date(w.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Applications: parseInt(w.count),
  }));

  return (
    <div style={styles.shell}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.brand}>Trackr</div>
        <a href="/" style={{ ...styles.navItem, ...styles.navActive }}>Dashboard</a>
        <a href="/applications" style={styles.navItem}>Applications</a>
        <a href="/companies" style={styles.navItem}>Companies</a>
        <a href="/interviews" style={styles.navItem}>Interviews</a>
        <a href="/reminders" style={styles.navItem}>Reminders</a>
        <button onClick={logout} style={styles.logoutBtn}>Logout</button>
      </div>

      {/* Main */}
      <div style={styles.main}>
        <div style={styles.topbar}>
          <h1 style={styles.title}>Good morning, {user?.name} 👋</h1>
          <a href="/applications/new" style={styles.addBtn}>+ Add application</a>
        </div>

        {/* Stat Cards */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Applied</div>
            <div style={styles.statVal}>{totalApplied}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Interviews</div>
            <div style={styles.statVal}>{byStatus.interview || 0}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Offers</div>
            <div style={styles.statVal}>{byStatus.offer || 0}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Response Rate</div>
            <div style={styles.statVal}>{responseRate}%</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Avg Response</div>
            <div style={styles.statVal}>{avgResponseDays ? `${avgResponseDays}d` : 'N/A'}</div>
          </div>
        </div>

        {/* Pipeline */}
        <div style={styles.twoCol}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>Pipeline</div>
            {['applied','screening','interview','offer','accepted','rejected'].map(status => (
              <div key={status} style={styles.pipeRow}>
                <span style={styles.pipeLabel}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                <div style={styles.pipeBarBg}>
                  <div style={{
                    ...styles.pipeBar,
                    width: `${totalApplied ? ((byStatus[status] || 0) / totalApplied) * 100 : 0}%`,
                  }} />
                </div>
                <span style={styles.pipeCount}>{byStatus[status] || 0}</span>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>Applications — last 8 weeks</div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="Applications" fill="#534AB7" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: '#999', fontSize: '14px' }}>No data yet. Start adding applications!</p>
            )}
          </div>
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
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' },
  statCard: {
    background: 'white', padding: '16px', borderRadius: '10px',
    border: '1px solid #eee',
  },
  statLabel: { fontSize: '12px', color: '#999', marginBottom: '6px' },
  statVal: { fontSize: '24px', fontWeight: '600', color: '#222' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  card: { background: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #eee' },
  cardHeader: { fontSize: '14px', fontWeight: '500', color: '#555', marginBottom: '16px' },
  pipeRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  pipeLabel: { fontSize: '13px', color: '#555', width: '80px' },
  pipeBarBg: { flex: 1, height: '6px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' },
  pipeBar: { height: '100%', background: '#534AB7', borderRadius: '4px' },
  pipeCount: { fontSize: '12px', color: '#999', width: '20px', textAlign: 'right' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' },
};

export default Dashboard;