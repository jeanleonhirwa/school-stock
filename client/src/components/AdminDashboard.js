import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/stats');
      setStats(response.data);
    } catch (error) {
      setMessage({ text: 'Error fetching dashboard statistics', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!stats) {
    return (
      <div className="card">
        <div className="alert alert-error">
          Failed to load dashboard data. Please try refreshing.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <h2>📊 Admin Dashboard</h2>
        
        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Main Statistics Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-number">{stats.total_materials}</span>
            <div className="stat-label">📦 Total Materials</div>
          </div>
          
          <div className="stat-card">
            <span className="stat-number">{stats.total_students}</span>
            <div className="stat-label">👥 Registered Students</div>
          </div>
          
          <div className="stat-card">
            <span className="stat-number" style={{ color: '#ffc107' }}>{stats.currently_borrowed}</span>
            <div className="stat-label">📝 Currently Borrowed</div>
          </div>
          
          <div className="stat-card">
            <span className="stat-number" style={{ color: '#dc3545' }}>{stats.overdue_items}</span>
            <div className="stat-label">⚠️ Overdue Items</div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {stats.low_stock_items.length > 0 && (
          <div className="alert alert-warning">
            <h4>⚠️ Low Stock Alert</h4>
            <p>The following materials are running low (less than 5 items):</p>
            <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
              {stats.low_stock_items.map((item, index) => (
                <li key={index}>
                  <strong>{item.name}</strong>: {item.quantity_available} remaining
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Overdue Items Alert */}
        {stats.overdue_items > 0 && (
          <div className="alert alert-error">
            <h4>🚨 Overdue Items Alert</h4>
            <p>There are <strong>{stats.overdue_items}</strong> items that are overdue (borrowed for more than 7 days).</p>
            <p>Please follow up with students to ensure timely returns.</p>
          </div>
        )}
      </div>

      {/* Popular Materials */}
      <div className="card">
        <h3>📈 Most Popular Materials</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Material Name</th>
                <th>Total Borrows</th>
                <th>Popularity</th>
              </tr>
            </thead>
            <tbody>
              {stats.popular_materials.map((material, index) => (
                <tr key={index}>
                  <td><strong>{material.name}</strong></td>
                  <td>{material.borrow_count}</td>
                  <td>
                    <div style={{ 
                      background: '#e9ecef', 
                      borderRadius: '10px', 
                      height: '20px', 
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        background: '#667eea',
                        height: '100%',
                        width: `${Math.min((material.borrow_count / Math.max(...stats.popular_materials.map(m => m.borrow_count))) * 100, 100)}%`,
                        borderRadius: '10px',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3>⚡ Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
            <h4>📦 Stock Management</h4>
            <p>Add new materials or update existing stock levels</p>
            <button className="btn btn-success">Manage Stock</button>
          </div>
          
          <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
            <h4>↩️ Process Returns</h4>
            <p>Mark borrowed items as returned</p>
            <button className="btn btn-warning">Process Returns</button>
          </div>
          
          <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
            <h4>📋 View History</h4>
            <p>Check complete borrowing and return history</p>
            <button className="btn">View History</button>
          </div>
          
          <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
            <h4>📊 Generate Report</h4>
            <p>Export data for analysis</p>
            <button className="btn">Export Data</button>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="card">
        <h3>🔧 System Health</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <strong>Database Status:</strong>
            <span style={{ color: '#28a745', marginLeft: '0.5rem' }}>✅ Connected</span>
          </div>
          <div>
            <strong>API Status:</strong>
            <span style={{ color: '#28a745', marginLeft: '0.5rem' }}>✅ Operational</span>
          </div>
          <div>
            <strong>Last Updated:</strong>
            <span style={{ marginLeft: '0.5rem' }}>{new Date().toLocaleString()}</span>
          </div>
          <div>
            <button 
              className="btn btn-small" 
              onClick={fetchStats}
              disabled={loading}
            >
              🔄 Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
