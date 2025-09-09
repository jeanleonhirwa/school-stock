import React, { useState, useEffect } from 'react';
import axios from 'axios';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [filters, setFilters] = useState({
    student: '',
    class_name: '',
    date_from: '',
    date_to: '',
    material: '',
    return_status: ''
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Add non-empty filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const response = await axios.get(`/api/history?${params.toString()}`);
      setHistory(response.data);
    } catch (error) {
      setMessage({ text: 'Error fetching history', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const clearFilters = () => {
    setFilters({
      student: '',
      class_name: '',
      date_from: '',
      date_to: '',
      material: '',
      return_status: ''
    });
    // Fetch history with cleared filters
    setTimeout(() => fetchHistory(), 100);
  };

  const getStatusBadge = (item) => {
    if (item.is_returned) {
      return <span className="status-badge status-returned">Returned</span>;
    } else if (item.status === 'Overdue') {
      return <span className="status-badge status-overdue">Overdue</span>;
    } else {
      return <span className="status-badge status-borrowed">Borrowed</span>;
    }
  };

  const exportToCSV = () => {
    if (history.length === 0) {
      setMessage({ text: 'No data to export', type: 'warning' });
      return;
    }

    const headers = ['Student Name', 'Class', 'Section/Trade', 'Material', 'Quantity', 'Borrow Date', 'Return Date', 'Status', 'Days Since Borrow'];
    const csvContent = [
      headers.join(','),
      ...history.map(item => [
        `"${item.full_name}"`,
        `"${item.class}"`,
        `"${item.section_or_trade}"`,
        `"${item.material_name}"`,
        item.quantity,
        item.borrow_date,
        item.return_date || 'Not returned',
        item.status,
        item.days_since_borrow
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `school_stock_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setMessage({ text: 'History exported successfully!', type: 'success' });
  };

  return (
    <div>
      <div className="card">
        <h2>📋 Borrowing & Return History</h2>
        
        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Filter Form */}
        <div className="filter-form">
          <h3>🔍 Filter Records</h3>
          <form onSubmit={handleFilterSubmit}>
            <div className="filter-row">
              <div className="form-group">
                <label htmlFor="student">Student Name</label>
                <input
                  type="text"
                  id="student"
                  name="student"
                  className="form-control"
                  value={filters.student}
                  onChange={handleFilterChange}
                  placeholder="Search by student name..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="class_name">Class</label>
                <input
                  type="text"
                  id="class_name"
                  name="class_name"
                  className="form-control"
                  value={filters.class_name}
                  onChange={handleFilterChange}
                  placeholder="e.g., Form 2, Trade A"
                />
              </div>

              <div className="form-group">
                <label htmlFor="material">Material</label>
                <input
                  type="text"
                  id="material"
                  name="material"
                  className="form-control"
                  value={filters.material}
                  onChange={handleFilterChange}
                  placeholder="Search by material..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="return_status">Status</label>
                <select
                  id="return_status"
                  name="return_status"
                  className="form-control"
                  value={filters.return_status}
                  onChange={handleFilterChange}
                >
                  <option value="">All Status</option>
                  <option value="borrowed">Currently Borrowed</option>
                  <option value="returned">Returned</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="date_from">From Date</label>
                <input
                  type="date"
                  id="date_from"
                  name="date_from"
                  className="form-control"
                  value={filters.date_from}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="date_to">To Date</label>
                <input
                  type="date"
                  id="date_to"
                  name="date_to"
                  className="form-control"
                  value={filters.date_to}
                  onChange={handleFilterChange}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-success" disabled={loading}>
                🔍 Apply Filters
              </button>
              <button type="button" className="btn" onClick={clearFilters}>
                🗑️ Clear Filters
              </button>
              <button type="button" className="btn btn-warning" onClick={exportToCSV}>
                📊 Export CSV
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>📊 Records ({history.length} total)</h3>
          <button 
            className="btn btn-small" 
            onClick={fetchHistory}
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading history...</div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <h4>📭 No records found</h4>
            <p>No borrowing records match your current filters.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Section/Trade</th>
                  <th>Material</th>
                  <th>Quantity</th>
                  <th>Borrow Date</th>
                  <th>Return Date</th>
                  <th>Days</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.full_name}</strong></td>
                    <td>{item.class}</td>
                    <td>{item.section_or_trade}</td>
                    <td>{item.material_name}</td>
                    <td>{item.quantity}</td>
                    <td>{new Date(item.borrow_date).toLocaleDateString()}</td>
                    <td>
                      {item.return_date ? 
                        new Date(item.return_date).toLocaleDateString() : 
                        <em style={{ color: '#666' }}>Not returned</em>
                      }
                    </td>
                    <td>{item.days_since_borrow}</td>
                    <td>{getStatusBadge(item)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Statistics */}
        {history.length > 0 && (
          <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '6px' }}>
            <h4>📈 Summary Statistics</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <strong>Total Records:</strong> {history.length}
              </div>
              <div>
                <strong>Returned Items:</strong> {history.filter(item => item.is_returned).length}
              </div>
              <div>
                <strong>Still Borrowed:</strong> {history.filter(item => !item.is_returned).length}
              </div>
              <div>
                <strong>Overdue Items:</strong> {history.filter(item => item.status === 'Overdue').length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
