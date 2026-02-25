import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ThankYouPage from './pages/ThankYouPage';
import BookingPage from './pages/BookingPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './services/api';
import { setCredentials, logout, setAuthLoading } from './store/authSlice';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const data = await checkAuth();
        if (data.success) {
          dispatch(setCredentials());
        }
      } catch (error) {
        dispatch(logout()); // Ensure state is cleared on fail
      } finally {
        dispatch(setAuthLoading(false));
      }
    };
    verifyAuth();
  }, [dispatch]);

  // Protected Route wrapper that uses Redux state
  const ProtectedRoute = ({ children }) => {
    if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Loading...</div>;
    return isAuthenticated ? children : <Navigate to="/admin" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/booking" element={<BookingPage />} />

        {/* Pass auth state to login to redirect if already logged in */}
        <Route path="/admin" element={
          isAuthenticated ? <Navigate to="/admin/dashboard" /> : <AdminLogin />
        } />

        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;