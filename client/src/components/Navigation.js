import React from 'react';

const Navigation = ({ activeView, setActiveView }) => {
  const navItems = [
    { key: 'borrow', label: 'Borrow Items', icon: '📝' },
    { key: 'return', label: 'Return Items', icon: '↩️' },
    { key: 'stock', label: 'Manage Stock', icon: '📦' },
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'history', label: 'History', icon: '📋' }
  ];

  return (
    <nav className="nav">
      <div className="nav-buttons">
        {navItems.map(item => (
          <button
            key={item.key}
            className={`nav-btn ${activeView === item.key ? 'active' : ''}`}
            onClick={() => setActiveView(item.key)}
          >
            <span style={{ marginRight: '8px' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
