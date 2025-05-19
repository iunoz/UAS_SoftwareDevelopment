import React from 'react';
import AdminNavbar from '../components/AdminNavbar';
import '../styles/AdminOrders.css';
import chandelier from '../assets/images/chandelier.jpg';

const orders = [
  {
    id: 1,
    product: 'Modern Crystal Bloom Chandelier',
    status: (
      <>
        <span className="underline">In Packaging</span> / In Delivery
      </>
    ),
    recipient: 'Kevin Ligma',
  },
  {
    id: 2,
    product: 'Modern Crystal Bloom Chandelier',
    status: (
      <>
        In Packaging / <span className="underline">In Delivery</span>
      </>
    ),
    recipient: 'John Pork',
  },
  {
    id: 3,
    product: 'Modern Crystal Bloom Chandelier',
    status: 'Arrived',
    recipient: 'Trallalelo Trallala',
  },
];

const AdminOrders = () => {
  return (
    <div className="dashboard-admin">
      <AdminNavbar />
      <div className="dashboard-content admin-orders-content">
        <h1 className="orders-title">ON GOING ORDERS</h1>
        <div className="orders-list">
          {orders.map((order, idx) => (
            <div className="order-card" key={order.id}>
              <div className="order-img-col">
                <img src={chandelier} alt="chandelier" className="order-chandelier-img" />
              </div>
              <div className="order-info-col">
                <div className="order-product">{order.product}</div>
                <div className="order-status">
                  <span>Shipping Status:</span>
                  <span className="order-status-value"> {order.status}</span>
                </div>
                <div className="order-recipient">
                  <span>Recipient:</span> {order.recipient}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
