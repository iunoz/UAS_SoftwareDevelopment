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
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/api/admin/dashboard-stats')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  useEffect(() => {
    let url = `http://localhost:4000/api/admin/daily-sales?month=${month}`;
    if (selectedProduct) url += `&product=${selectedProduct}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        console.log('dailySales:', data.salesByDay);
        setDailySales(data.salesByDay || []);
      });
  }, [month, selectedProduct]);

  useEffect(() => {
    fetch('http://localhost:4000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data.products || []));
  }, []);

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
          {/* Baris pertama: 2 card, masing-masing span 2 kolom, di tengah */}
          <div className="stat-card" style={{ gridColumn: '2 / 4', gridRow: '1' }}>
            <div className="admin-section-title">Total Penjualan</div>
            <div className="stat-value">Rp {stats.totalSales.toLocaleString('id-ID')}</div>
          </div>
          <div className="stat-card" style={{ gridColumn: '4 / 6', gridRow: '1' }}>
            <div className="admin-section-title">Produk Terjual</div>
            <div className="stat-value">{stats.totalProductsSold}</div>
          </div>
          {/* Baris kedua: 3 card, masing-masing span 2 kolom, saling tumpang tindih setengah */}
          <div className="stat-card" style={{ gridColumn: '1 / 3', gridRow: '2' }}>
            <div className="admin-section-title">Order Berjalan</div>
            <div className="stat-value">{stats.ongoingOrders}</div>
          </div>
          <div className="stat-card" style={{ gridColumn: '3 / 5', gridRow: '2' }}>
            <div className="admin-section-title">Order Selesai</div>
            <div className="stat-value">{stats.finishedOrders}</div>
          </div>
          <div className="stat-card" style={{ gridColumn: '5 / 7', gridRow: '2' }}>
            <div className="admin-section-title">Produk Terlaku</div>
            <div className="stat-value">{stats.bestProductName}</div>
          </div>
        </div>
        <div className="dashboard-main" style={{ background: '#262f60', borderRadius: 10, padding: '1.5rem' }}>
          <div className="dashboard-section">
            {/* Judul dan dropdown */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 16,
                position: 'relative'
              }}
            >
              {/* Dropdown produk di kiri */}
              <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
                <select
                  value={selectedProduct}
                  onChange={e => setSelectedProduct(e.target.value)}
                  style={{ minWidth: 180 }}
                >
                  <option value="">Semua Produk</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
              {/* Judul grafik */}
              <h2 className="admin-section-title" style={{ margin: 0, flex: 2, textAlign: 'center' }}>
                Grafik Pendapatan per Hari
              </h2>
              {/* Dropdown bulan di kanan */}
              <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <select value={month} onChange={e => setMonth(e.target.value)}>
                  {monthOptions.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
            <Bar
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: { callbacks: { label: ctx => `Rp ${ctx.parsed.y.toLocaleString('id-ID')}` } },
                  background: {
                    color: '#262f60'
                  }
                },
                scales: {
                  y: { beginAtZero: true, ticks: { callback: v => `Rp ${v.toLocaleString('id-ID')}` } }
                }
              }}
              plugins={[{
                id: 'customBackgroundColor',
                beforeDraw: (chart) => {
                  const ctx = chart.ctx;
                  ctx.save();
                  ctx.globalCompositeOperation = 'destination-over';
                  ctx.fillStyle = '#262f60';
                  ctx.fillRect(0, 0, chart.width, chart.height);
                  ctx.restore();
                }
              }]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;