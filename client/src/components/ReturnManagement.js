import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReturnManagement = () => {
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [processingReturn, setProcessingReturn] = useState(null);

  useEffect(() => {
    fetchBorrowedItems();
  }, []);

  const fetchBorrowedItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/borrowed');
      setBorrowedItems(response.data);
    } catch (error) {
      setMessage({ text: 'Error fetching borrowed items', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (borrowId, studentName, materialName) => {
    if (!window.confirm(`Confirm return of ${materialName} by ${studentName}?`)) {
      return;
    }

    try {
      setProcessingReturn(borrowId);
      await axios.post(`/api/return/${borrowId}`);
      setMessage({ text: 'Item returned successfully!', type: 'success' });
      fetchBorrowedItems(); // Refresh the list
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error processing return';
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setProcessingReturn(null);
    }
  };

  const getStatusBadge = (daysBorrowed) => {
    if (daysBorrowed > 7) {
      return <span className="status-badge status-overdue">Overdue ({daysBorrowed} days)</span>;
    } else if (daysBorrowed > 3) {
      return <span className="status-badge status-borrowed">Due Soon ({daysBorrowed} days)</span>;
    } else {
      return <span className="status-badge status-returned">Recent ({daysBorrowed} days)</span>;
    }
  };

  if (loading) {
    return <div className="loading">Loading borrowed items...</div>;
  }

  return (
    <div className="card">
      <h2>↩️ Return Management</h2>
      
      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {borrowedItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          <h3>🎉 No items currently borrowed!</h3>
          <p>All cleaning materials have been returned.</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '1rem', color: '#666' }}>
            <strong>{borrowedItems.length}</strong> item(s) currently borrowed
          </div>

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
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {borrowedItems.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.full_name}</strong></td>
                    <td>{item.class}</td>
                    <td>{item.section_or_trade}</td>
                    <td>{item.material_name}</td>
                    <td>{item.quantity}</td>
                    <td>{new Date(item.borrow_date).toLocaleDateString()}</td>
                    <td>{getStatusBadge(item.days_borrowed)}</td>
                    <td>
                      <button
                        className="btn btn-success btn-small"
                        onClick={() => handleReturn(item.id, item.full_name, item.material_name)}
                        disabled={processingReturn === item.id}
                      >
                        {processingReturn === item.id ? 'Processing...' : '✅ Mark Returned'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Statistics */}
          <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '6px' }}>
            <h4>📊 Summary</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <strong>Total Borrowed:</strong> {borrowedItems.length} items
              </div>
              <div>
                <strong>Overdue Items:</strong> {borrowedItems.filter(item => item.days_borrowed > 7).length}
              </div>
              <div>
                <strong>Due Soon:</strong> {borrowedItems.filter(item => item.days_borrowed > 3 && item.days_borrowed <= 7).length}
              </div>
              <div>
                <strong>Recent:</strong> {borrowedItems.filter(item => item.days_borrowed <= 3).length}
              </div>
            </div>
          </div>
        </>
      )}

      <div style={{ marginTop: '1rem' }}>
        <button 
          className="btn" 
          onClick={fetchBorrowedItems}
          disabled={loading}
        >
          🔄 Refresh List
        </button>
      </div>
    </div>
  );
};

export default ReturnManagement;
