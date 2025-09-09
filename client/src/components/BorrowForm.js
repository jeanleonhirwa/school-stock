import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BorrowForm = () => {
  const [formData, setFormData] = useState({
    student_name: '',
    class_name: '',
    section_or_trade: '',
    material_id: '',
    quantity: 1,
    borrow_date: new Date().toISOString().split('T')[0]
  });
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await axios.get('/api/stock');
      setMaterials(response.data);
    } catch (error) {
      setMessage({ text: 'Error fetching materials', type: 'error' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await axios.post('/api/borrow', formData);
      setMessage({ text: 'Item borrowed successfully!', type: 'success' });
      
      // Reset form
      setFormData({
        student_name: '',
        class_name: '',
        section_or_trade: '',
        material_id: '',
        quantity: 1,
        borrow_date: new Date().toISOString().split('T')[0]
      });
      
      // Refresh materials to show updated stock
      fetchMaterials();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error creating borrow record';
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const selectedMaterial = materials.find(m => m.id === parseInt(formData.material_id));

  return (
    <div className="card">
      <h2>📝 Borrow Cleaning Materials</h2>
      
      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="student_name">Student Full Name *</label>
            <input
              type="text"
              id="student_name"
              name="student_name"
              className="form-control"
              value={formData.student_name}
              onChange={handleInputChange}
              required
              placeholder="Enter student's full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="class_name">Class *</label>
            <input
              type="text"
              id="class_name"
              name="class_name"
              className="form-control"
              value={formData.class_name}
              onChange={handleInputChange}
              required
              placeholder="e.g., Form 2, Trade A"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="section_or_trade">Section/Trade *</label>
            <input
              type="text"
              id="section_or_trade"
              name="section_or_trade"
              className="form-control"
              value={formData.section_or_trade}
              onChange={handleInputChange}
              required
              placeholder="e.g., A, B, Carpentry"
            />
          </div>

          <div className="form-group">
            <label htmlFor="borrow_date">Borrow Date *</label>
            <input
              type="date"
              id="borrow_date"
              name="borrow_date"
              className="form-control"
              value={formData.borrow_date}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="material_id">Material/Tool *</label>
            <select
              id="material_id"
              name="material_id"
              className="form-control"
              value={formData.material_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a material...</option>
              {materials.map(material => (
                <option 
                  key={material.id} 
                  value={material.id}
                  disabled={material.quantity_available === 0}
                >
                  {material.name} (Available: {material.quantity_available})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity *</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              className="form-control"
              value={formData.quantity}
              onChange={handleInputChange}
              min="1"
              max={selectedMaterial?.quantity_available || 1}
              required
            />
            {selectedMaterial && (
              <small style={{ color: '#666', fontSize: '0.85rem' }}>
                Maximum available: {selectedMaterial.quantity_available}
              </small>
            )}
          </div>
        </div>

        <button 
          type="submit" 
          className="btn btn-success"
          disabled={loading || !formData.material_id}
        >
          {loading ? 'Processing...' : '📝 Submit Borrow Request'}
        </button>
      </form>

      {/* Current Stock Display */}
      <div style={{ marginTop: '2rem' }}>
        <h3>📦 Current Stock Levels</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Available Quantity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {materials.map(material => (
                <tr key={material.id}>
                  <td>{material.name}</td>
                  <td>{material.quantity_available}</td>
                  <td>
                    <span className={`status-badge ${
                      material.quantity_available === 0 ? 'status-overdue' :
                      material.quantity_available < 5 ? 'status-borrowed' : 'status-returned'
                    }`}>
                      {material.quantity_available === 0 ? 'Out of Stock' :
                       material.quantity_available < 5 ? 'Low Stock' : 'Available'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BorrowForm;
