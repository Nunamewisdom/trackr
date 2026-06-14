import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
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

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>Loading...</div>;

  const { byStatus = {}, totalApplied = 0, responseRate = 0, avgResponseDays, weeklyActivity = [] } = stats || {};

  const chartData = weeklyActivity.map((w) => ({
    week: new Date(w.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Applications: parseInt(w.count),
  }));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5' }}>
      <Sidebar active="Dashboard" />

      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#222' }}>Good morning, {user?.name} 👋</h1>
          <a href="/applications/new" style={{ background: '#534AB7', color: 'white', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
            + Add application
          </a>
        </div>

        <div className="stats-row">
          {[
            { label: 'Total Applied', value: totalApplied },
            { label: 'Interviews', value: byStatus.interview || 0 },
            { label: 'Offers', value: byStatus.offer || 0 },
            { label: 'Response Rate', value: `${responseRate}%` },
            { label: 'Avg Response', value: avgResponseDays ? `${avgResponseDays}d` : 'N/A' },
          ].map((stat) => (
            <div key={stat.label} style={{ background: 'white', padding: '16px', borderRadius: '10px', border: '1px solid #eee' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '6px' }}>{stat.label}</div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#222' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="two-col">
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #eee' }}>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#555', marginBottom: '16px' }}>Pipeline</div>
            {['applied','screening','interview','offer','accepted','rejected'].map(status => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#555', width: '80px', flexShrink: 0 }}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
                <div style={{ flex: 1, height: '6px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', background: '#534AB7', borderRadius: '4px',
                    width: `${totalApplied ? ((byStatus[status] || 0) / totalApplied) * 100 : 0}%`,
                  }} />
                </div>
                <span style={{ fontSize: '12px', color: '#999', width: '20px', textAlign: 'right' }}>
                  {byStatus[status] || 0}
                </span>
              </div>
            ))}
          </div>

          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #eee' }}>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#555', marginBottom: '16px' }}>Applications — last 8 weeks</div>
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

export default Dashboard;