import React, { useEffect, useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import '../styles/DashboardAdmin.css';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const DashboardAdmin = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProductsSold: 0,
    bestProductName: '',
    ongoingOrders: 0,
    finishedOrders: 0,
    salesByMonth: []
  });
  const [month, setMonth] = useState(getCurrentMonth());
  const [dailySales, setDailySales] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/admin/dashboard-stats')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  useEffect(() => {
    fetch(`http://localhost:4000/api/admin/daily-sales?month=${month}`)
      .then(res => res.json())
      .then(data => setDailySales(data.salesByDay || []));
  }, [month]);

  // Data untuk grafik harian
  const chartData = {
    labels: dailySales.map(item => item._id),
    datasets: [
      {
        label: 'Pendapatan (Rp)',
        data: dailySales.map(item => item.total),
        backgroundColor: '#c1a139'
      }
    ]
  };

  // Generate opsi bulan dari salesByMonth
  const monthOptions = stats.salesByMonth.map(item => item._id);

  return (
    <div className="dashboard-admin">
      <AdminNavbar />
      <div className="dashboard-content">
        <header>
          <h1 className='admin-page-title'>DASHBOARD PENJUALAN</h1>
        </header>
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-label">Total Penjualan</div>
            <div className="stat-value">Rp {stats.totalSales.toLocaleString('id-ID')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Produk Terjual</div>
            <div className="stat-value">{stats.totalProductsSold}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Order Berjalan</div>
            <div className="stat-value">{stats.ongoingOrders}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Order Selesai</div>
            <div className="stat-value">{stats.finishedOrders}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Produk Terlaku</div>
            <div className="stat-value">{stats.bestProductName}</div>
          </div>
        </div>
        <div className="dashboard-main">
          <div className="dashboard-section">
            {/* Judul di tengah & dropdown di kanan, satu baris */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 16,
                position: 'relative'
              }}
            >
              {/* Spacer kiri */}
              <div style={{ flex: 1 }} />
              {/* Judul di tengah */}
              <h2 style={{ margin: 0, flex: 2, textAlign: 'center' }}>
                Grafik Pendapatan per Hari
              </h2>
              {/* Dropdown di kanan */}
              <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <select value={month} onChange={e => setMonth(e.target.value)}>
                  {monthOptions.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
            <Bar data={chartData} options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: ctx => `Rp ${ctx.parsed.y.toLocaleString('id-ID')}` } }
              },
              scales: {
                y: { beginAtZero: true, ticks: { callback: v => `Rp ${v.toLocaleString('id-ID')}` } }
              }
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;