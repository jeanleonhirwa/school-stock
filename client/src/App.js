import React, { useState } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import BorrowForm from './components/BorrowForm';
import ReturnManagement from './components/ReturnManagement';
import AdminDashboard from './components/AdminDashboard';
import StockManagement from './components/StockManagement';
import History from './components/History';

function App() {
  const [activeView, setActiveView] = useState('borrow');

  const renderActiveView = () => {
    switch (activeView) {
      case 'borrow':
        return <BorrowForm />;
      case 'return':
        return <ReturnManagement />;
      case 'stock':
        return <StockManagement />;
      case 'dashboard':
        return <AdminDashboard />;
      case 'history':
        return <History />;
      default:
        return <BorrowForm />;
    }
  };

  return (
    <div className="App">
      <Header />
      <div className="container">
        <Navigation activeView={activeView} setActiveView={setActiveView} />
        {renderActiveView()}
      </div>
    </div>
  );
}

export default App;
