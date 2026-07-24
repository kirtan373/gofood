import './App.css';
import Landing from './screens/Landing';
import Home from './screens/Home';
import ProductDetails from './screens/ProductDetails';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import Login from './screens/Login';
import Signup from './screens/Signup';
import ForgotPassword from './screens/ForgotPassword';
import MyOrder from './screens/MyOrder';
import Checkout from './screens/Checkout';
import Cart from './screens/Cart';
import PaymentStatus from './screens/PaymentStatus';

import '../node_modules/bootstrap-dark-5/dist/css/bootstrap-dark.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import { CartProvider } from './components/ContextReducer';
import { ToastProvider } from './components/Toast';
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import { UserAuthProvider } from './context/UserAuthContext';

import ProtectedRoute from './admin/components/ProtectedRoute';
import AdminLayout from './admin/components/AdminLayout';

import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboardPage from './admin/pages/AdminDashboardPage';
import FoodsPage from './admin/pages/FoodsPage';
import CategoriesPage from './admin/pages/CategoriesPage';
import OrdersPage from './admin/pages/OrdersPage';
import UsersPage from './admin/pages/UsersPage';
import RevenuePage from './admin/pages/RevenuePage';
import SettingsPage from './admin/pages/SettingsPage';
import ReviewsPage from './admin/pages/ReviewsPage';

function App() {
  return (
    <ToastProvider>
    <CartProvider>
      <AdminAuthProvider>
        <Router>
          <UserAuthProvider>
          <Routes>

            {/* User Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/menu" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/createuser" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/myOrder" element={<MyOrder />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment/status" element={<PaymentStatus />} />
            <Route path="/payment/status/:gateway" element={<PaymentStatus />} />

            {/* Product Details */}
            <Route path="/product/:id" element={<ProductDetails />} />

            {/* Admin Login */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="foods" element={<FoodsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="revenue" element={<RevenuePage />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

          </Routes>
          </UserAuthProvider>
        </Router>
      </AdminAuthProvider>
    </CartProvider>
    </ToastProvider>
  );
}

export default App;