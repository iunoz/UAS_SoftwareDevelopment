import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import CartPage from './pages/CartPage';
import Payment from './pages/Payment';
import './App.css';

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login' || 
    location.pathname === '/register' || 
    location.pathname === '/admindashboard' || 
    location.pathname === '/productadmin' || 
    location.pathname === '/addproduct' || 
    location.pathname === '/adminorders' || 
    location.pathname === '/cart' ||
    location.pathname === '/profile' ||
    location.pathname === '/payment' ||
    /^\/[^/]+\/admindashboard$/.test(location.pathname) ||
    /^\/[^/]+\/productadmin$/.test(location.pathname) ||
    /^\/[^/]+\/addproduct$/.test(location.pathname) ||
    /^\/[^/]+\/adminorders$/.test(location.pathname) ||
    /^\/[^/]+\/cart$/.test(location.pathname) ||
    /^\/[^/]+\/profile$/.test(location.pathname) ||
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
        <Route path="/cart" element={<CartPage />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/:uid" element={<HomePage />} />
        <Route path="/:uid/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/:uid/products" element={<ProductPage />} />
        <Route path="/:uid/admindashboard" element={<DashboardAdmin />} />
        <Route path="/:uid/profile" element={<ProfilePage />} />
        <Route path="/:uid/productadmin" element={<ProductAdmin />} />
        <Route path="/:uid/addproduct" element={<AddProduct />} />
        <Route path="/:uid/adminorders" element={<AdminOrders />} />
        <Route path="/:uid/cart" element={<CartPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;