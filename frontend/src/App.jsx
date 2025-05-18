import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPassword';
import ProductPage from './pages/ProductPage';
import DashboardAdmin from './pages/DashboardAdmin';
import ProductAdmin from './pages/ProductAdmin';
import ProfilePage from './pages/ProfilePage';
import './App.css';

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login' || location.pathname === '/register'  || location.pathname === '/admindashboard' || location.pathname === '/productadmin';
  return (
    <div className="App">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/admindashboard" element={<DashboardAdmin />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/productadmin" element={<ProductAdmin />} />
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