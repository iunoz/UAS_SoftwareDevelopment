import React, { useEffect, useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import '../styles/AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState(''); // Tambah state search
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/payment/orders/admin');
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        setOrders(data.orders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = (status) => {
    setStatusFilter(status);
  };

  // Filter orders by status and search term
  const filteredOrders = orders.filter(order => {
    // Filter by status
    const statusMatch = statusFilter.toLowerCase() === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
    // Filter by search term (id or name)
    if (!searchTerm.trim()) return statusMatch;
    const term = searchTerm.trim().toLowerCase();
    const idMatch = order._id && order._id.toLowerCase().includes(term);
    const nameMatch = order.userName && order.userName.toLowerCase().includes(term);
    return statusMatch && (idMatch || nameMatch);
  });

  if (loading) {
    return (
      <div className="dashboard-admin">
        <AdminNavbar />
        <div className="dashboard-content admin-orders-content">
          <h1 className="orders-title">ON GOING ORDERS</h1>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-admin">
      <AdminNavbar />
      <Container className="dashboard-content admin-orders-content">
        <h1 className="orders-title">ON GOING ORDERS</h1>
        {/* Search Bar */}
        <div className="mb-3 d-flex justify-content-center align-items-center gap-2">
          <input
            type="text"
            className="admin-orders-searchbar"
            style={{ maxWidth: 600, minWidth: 300, width: '100%' }}
            placeholder="Search by Order ID or Buyer Name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
          />
          <Button
            variant="warning"
            style={{ height: '42px', fontWeight: 600, fontFamily: 'Georgia, serif', color: '#222d52', minWidth: 90 }}
            onClick={e => { /* Tidak perlu aksi khusus, filter sudah realtime */ }}
          >
            Search
          </Button>
        </div>
        <div className="order-filter-buttons mb-3 d-flex justify-content-center gap-3">
          {['All', 'Belum Bayar', 'Sedang Dikemas', 'Dikirim', 'Selesai'].map((status) => {
            const isActive = statusFilter === status;
            return (
              <Button
                key={status}
                variant={isActive ? 'primary' : 'outline-primary'}
                className={`filter-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleStatusChange(status)}
              >
                {status}
              </Button>
            );
          })}
        </div>
        <div className="orders-scroll-list">
          {filteredOrders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order._id}
                className="mb-3 p-2 d-flex align-items-stretch order-list-row"
                style={{
                  background: '#222a4d',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  minHeight: 110,
                  border: '1px solid #2E3A6C',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
                }}
                onClick={() => {
                  let role = localStorage.getItem('role');
                  if (!role) {
                    role = sessionStorage.getItem('role');
                  }
                  const isAdmin = role === 'admin' || role === 'superadmin';
                  navigate('/order-receipt', {
                    state: {
                      items: order.items,
                      status: order.status,
                      userName: order.userName,
                      orderId: order._id,
                      totalAmount: order.totalAmount,
                      Address: order.Address,
                      courier: order.courier,
                      isAdmin: isAdmin
                    }
                  });
                }}
              >
                {/* Detail pesanan di kiri */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 1.5rem 0 0', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  <div><strong>Ordered By:</strong> {order.userName}</div>
                  <div><strong>Status:</strong> {order.status}</div>
                  <div>
                    <strong>Items:</strong>
                    <ul style={{ marginBottom: 0 }}>
                      {order.items.map((item) => (
                        <li key={item._id} style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                          Product: {item.product?.name || item.product} - Quantity: {item.quantity} - Price: {item.priceAtPurchase}
                          {item.receipt && (
                            <div>
                              Receipt: <a href={item.receipt} target="_blank" rel="noopener noreferrer">View</a>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {/* Order ID di kanan */}
                <div className="order-id-col">
                  <span className="order-id-label">ORDER ID:</span><br />
                  <span className="order-id-value">{order._id}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Container>
    </div>
  );
};

export default AdminOrders;
