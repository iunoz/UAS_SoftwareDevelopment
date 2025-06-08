import React, { useEffect, useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import '../styles/AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
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

  const filteredOrders = orders.filter(order => {
    if (statusFilter.toLowerCase() === 'all') return true;
    return order.status.toLowerCase() === statusFilter.toLowerCase();
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
                className="mb-3 p-2"
                style={{
                  background: '#222a4d',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
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
                <div><strong>Order by:</strong> {order.userName}</div>
                <div><strong>Status:</strong> {order.status}</div>
                <div>
                  <strong>Items:</strong>
                  <ul>
                    {order.items.map((item) => (
                      <li key={item._id}>
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
            ))
          )}
        </div>
      </Container>
    </div>
  );
};

export default AdminOrders;
