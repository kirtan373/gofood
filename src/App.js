import React, { Suspense, lazy } from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import '../node_modules/bootstrap-dark-5/dist/css/bootstrap-dark.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import { CartProvider } from './components/ContextReducer';
import { ToastProvider } from './components/Toast';
import { ThemeProvider } from './context/ThemeContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import { UserAuthProvider } from './context/UserAuthContext';

import ProtectedRoute from './admin/components/ProtectedRoute';
import AdminLayout from './admin/components/AdminLayout';
import GlobalUI from './components/GlobalUI';
import NotFound from './components/NotFound';

import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboardPage from './admin/pages/AdminDashboardPage';
import FoodsPage from './admin/pages/FoodsPage';
import CategoriesPage from './admin/pages/CategoriesPage';
import OrdersPage from './admin/pages/OrdersPage';
import UsersPage from './admin/pages/UsersPage';
import RevenuePage from './admin/pages/RevenuePage';
import SettingsPage from './admin/pages/SettingsPage';
import ReviewsPage from './admin/pages/ReviewsPage';

// Code-split the storefront so the initial bundle stays lean.
const Landing = lazy(() => import('./screens/Landing'));
const Home = lazy(() => import('./screens/Home'));
const ProductDetails = lazy(() => import('./screens/ProductDetails'));
const Login = lazy(() => import('./screens/Login'));
const Signup = lazy(() => import('./screens/Signup'));
const ForgotPassword = lazy(() => import('./screens/ForgotPassword'));
const MyOrder = lazy(() => import('./screens/MyOrder'));
const Checkout = lazy(() => import('./screens/Checkout'));
const Cart = lazy(() => import('./screens/Cart'));
const PaymentStatus = lazy(() => import('./screens/PaymentStatus'));
const Wishlist = lazy(() => import('./screens/Wishlist'));

function PageLoader() {
  return (
    <div className="app-loader">
      <div className="app-loader-spinner"></div>
      <p>Loading Delicious Food...</p>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
    <ToastProvider>
    <CartProvider>
      <FavoritesProvider>
      <AdminAuthProvider>
        <Router>
          <UserAuthProvider>
          <Suspense fallback={<PageLoader />}>
          <Routes>

            {/* User Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/menu" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/createuser" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/myOrder" element={<MyOrder />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
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

            {/* 404 */}
            <Route path="*" element={<NotFound />} />

          </Routes>
          </Suspense>
          <GlobalUI />
          </UserAuthProvider>
        </Router>
      </AdminAuthProvider>
      </FavoritesProvider>
    </CartProvider>
    </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
