import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StockManagement = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/stock');
      setMaterials(response.data);
    } catch (error) {
      setMessage({ text: 'Error fetching materials', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/stock', formData);
      setMessage({ text: 'Material added successfully!', type: 'success' });
      setFormData({ name: '', quantity: 0 });
      setShowAddForm(false);
      fetchMaterials();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error adding material';
      setMessage({ text: errorMessage, type: 'error' });
    }
  };

  const handleUpdateStock = async (materialId, newQuantity) => {
    try {
      await axios.put(`/api/stock/${materialId}`, { quantity_available: newQuantity });
      setMessage({ text: 'Stock updated successfully!', type: 'success' });
      setEditingMaterial(null);
      fetchMaterials();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error updating stock';
      setMessage({ text: errorMessage, type: 'error' });
    }
  };

  const handleAddStock = async (materialId, additionalQuantity) => {
    try {
      const material = materials.find(m => m.id === materialId);
      await axios.post('/api/stock', { 
        name: material.name, 
        quantity: additionalQuantity 
      });
      setMessage({ text: 'Stock added successfully!', type: 'success' });
      fetchMaterials();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error adding stock';
      setMessage({ text: errorMessage, type: 'error' });
    }
  };

  if (loading) {
    return <div className="loading">Loading stock information...</div>;
  }

  return (
    <div className="card">
      <h2>📦 Stock Management</h2>
      
      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <button 
          className="btn btn-success"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '❌ Cancel' : '➕ Add New Material'}
        </button>
      </div>

      {showAddForm && (
        <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h3>Add New Material</h3>
          <form onSubmit={handleAddMaterial}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Material Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Vacuum Cleaner, Dustpan"
                />
              </div>
              <div className="form-group">
                <label htmlFor="quantity">Initial Quantity *</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  className="form-control"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-success">
              ➕ Add Material
            </button>
          </form>
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Material Name</th>
              <th>Current Stock</th>
              <th>Status</th>
              <th>Added Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(material => (
              <tr key={material.id}>
                <td><strong>{material.name}</strong></td>
                <td>
                  {editingMaterial === material.id ? (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        defaultValue={material.quantity_available}
                        style={{ width: '80px', padding: '4px' }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateStock(material.id, parseInt(e.target.value));
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value !== material.quantity_available.toString()) {
                            handleUpdateStock(material.id, parseInt(e.target.value));
                          } else {
                            setEditingMaterial(null);
                          }
                        }}
                        autoFocus
                      />
                      <button 
                        className="btn btn-small"
                        onClick={() => setEditingMaterial(null)}
                      >
                        ❌
                      </button>
                    </div>
                  ) : (
                    <span 
                      style={{ cursor: 'pointer' }}
                      onClick={() => setEditingMaterial(material.id)}
                      title="Click to edit"
                    >
                      {material.quantity_available}
                    </span>
                  )}
                </td>
                <td>
                  <span className={`status-badge ${
                    material.quantity_available === 0 ? 'status-overdue' :
                    material.quantity_available < 5 ? 'status-borrowed' : 'status-returned'
                  }`}>
                    {material.quantity_available === 0 ? 'Out of Stock' :
                     material.quantity_available < 5 ? 'Low Stock' : 'In Stock'}
                  </span>
                </td>
                <td>{new Date(material.created_at).toLocaleDateString()}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-small"
                      onClick={() => {
                        const quantity = prompt('Add quantity:', '1');
                        if (quantity && parseInt(quantity) > 0) {
                          handleAddStock(material.id, parseInt(quantity));
                        }
                      }}
                    >
                      ➕ Add Stock
                    </button>
                    <button
                      className="btn btn-small btn-warning"
                      onClick={() => setEditingMaterial(material.id)}
                    >
                      ✏️ Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stock Summary */}
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '6px' }}>
        <h4>📊 Stock Summary</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <strong>Total Materials:</strong> {materials.length}
          </div>
          <div>
            <strong>Out of Stock:</strong> {materials.filter(m => m.quantity_available === 0).length}
          </div>
          <div>
            <strong>Low Stock:</strong> {materials.filter(m => m.quantity_available > 0 && m.quantity_available < 5).length}
          </div>
          <div>
            <strong>Well Stocked:</strong> {materials.filter(m => m.quantity_available >= 5).length}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <button 
          className="btn" 
          onClick={fetchMaterials}
          disabled={loading}
        >
          🔄 Refresh Stock
        </button>
      </div>
    </div>
  );
};

export default StockManagement;
