import React from 'react';
import AdminNavbar from '../components/AdminNavbar';
import '../styles/DashboardAdmin.css';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faShoppingCart, faDollarSign } from '@fortawesome/free-solid-svg-icons';

const DashboardAdmin = () => {
  return (
    <div className="dashboard-admin">
      <AdminNavbar />
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>Monthly Sales</h1>
        </header>

        <div className="dashboard-stats">
        {/* Visitor Card */}
        <div className="stat-card visitor">
          <div className="stat-trend negative">
            <FiTrendingDown /> -3.65%
          </div>
          <div className="stat-icon">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Visitors</div>
            <div className="stat-value">3.010</div>
            <div className="stat-sublabel">Since Last Month</div>
          </div>
        </div>

        {/* Order Card */}
        <div className="stat-card visitor">
          <div className="stat-trend negative">
            <FiTrendingDown /> -2.65%
          </div>
          <div className="stat-icon">
            <FontAwesomeIcon icon={faShoppingCart} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Orders</div>
            <div className="stat-value">5.069</div>
            <div className="stat-sublabel">Since Last Month</div>
          </div>
        </div>

        {/* Sales Card - full width */}
        <div className="stat-card full-width visitor">
          <div className="stat-trend negative">
            <FiTrendingDown /> -3.45%
          </div>
          <div className="stat-icon">
            <FontAwesomeIcon icon={faDollarSign} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Sales</div>
            <div className="stat-value">Rp 70.382.000</div>
            <div className="stat-sublabel">Since Last Month</div>
          </div>
        </div>
        </div>

        <div className="dashboard-main">
          <div className="dashboard-section">
            <h2>Dashboard</h2>
            {/* Add your dashboard content here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
