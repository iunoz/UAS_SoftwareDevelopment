import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPassword';
import ProductPage from './pages/ProductPage';
import ProductDetailPage from './pages/ProductDetailPage';
import DashboardAdmin from './pages/DashboardAdmin';
import ProductAdmin from './pages/ProductAdmin';
import ProfilePage from './pages/ProfilePage';
import AddProduct from './pages/AddProduct';
import AdminOrders from './pages/AdminOrders';
import Cart from './pages/cart';
import Payment from './pages/Payment';
import SetRolePage from './pages/SetRolePage';
import OrderSummary from './pages/OrderSummary';
import OrderReceipt from './pages/OrderReceipt'; // Import OrderReceipt page
import './App.css';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const rememberMe = localStorage.getItem('rememberMe');
    const user = rememberMe
      ? JSON.parse(localStorage.getItem('user') || '{}')
      : JSON.parse(sessionStorage.getItem('user') || '{}');

    if (rememberMe && user?.uid) {
      // Jika di halaman root, login, atau register, redirect sesuai role
      if (
        location.pathname === '/' ||
        location.pathname === '/login' ||
        location.pathname === '/register'
      ) {
        if (user.role === 'admin' || user.role === 'superadmin') {
          navigate(`/${user.uid}/admindashboard`, { replace: true });
        } else {
          navigate(`/${user.uid}`, { replace: true });
        }
      }
    } else {
      // Jika tidak rememberMe, hapus user dari localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      localStorage.removeItem('rememberMe');
    }
  }, [location.pathname, navigate]); // hanya saat mount

  const hideNavbar = location.pathname === '/login' || 
    location.pathname === '/register' || 
    location.pathname === '/admindashboard' || 
    location.pathname === '/productadmin' || 
    location.pathname === '/addproduct' || 
    location.pathname === '/adminorders' || 
    location.pathname === '/cart' ||
    location.pathname === '/profile' ||
    location.pathname === '/payment' ||
    location.pathname === '/order-summary' || // hide navbar on order summary
    location.pathname === '/forgot-password' ||
    location.pathname === '/order-receipt' || // hide navbar on order receipt
    /^\/[^/]+\/admindashboard$/.test(location.pathname) ||
    /^\/[^/]+\/productadmin$/.test(location.pathname) ||
    /^\/[^/]+\/addproduct$/.test(location.pathname) ||
    /^\/[^/]+\/adminorders$/.test(location.pathname) ||
    /^\/[^/]+\/cart$/.test(location.pathname) ||
    /^\/[^/]+\/profile$/.test(location.pathname) ||
    /^\/[^/]+\/forgot-password$/.test(location.pathname) ||
    /^\/[^/]+\/setrole$/.test(location.pathname) ||
    location.pathname.startsWith('/product/');
    
  return (
    <div className="App">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/admindashboard" element={<DashboardAdmin />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/productadmin" element={<ProductAdmin />} />
        <Route path="/addproduct" element={<AddProduct />} />
        <Route path="/adminorders" element={<AdminOrders />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/order-summary" element={<OrderSummary />} />
        <Route path="/order-receipt" element={<OrderReceipt />} /> {/* New route for OrderReceipt */}
        <Route path="/:uid" element={<HomePage />} />
        <Route path="/:uid/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/:uid/products" element={<ProductPage />} />
        <Route path="/:uid/product/:id" element={<ProductDetailPage />} />
        <Route path="/:uid/admindashboard" element={<DashboardAdmin />} />
        <Route path="/:uid/profile" element={<ProfilePage />} />
        <Route path="/:uid/productadmin" element={<ProductAdmin />} />
        <Route path="/:uid/addproduct" element={<AddProduct />} />
        <Route path="/:uid/adminorders" element={<AdminOrders />} />
        <Route path="/:uid/cart" element={<Cart />} />
        <Route path="/:uid/setrole" element={<SetRolePage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </Router>
  );
}

export default App;