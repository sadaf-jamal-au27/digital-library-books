import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Library from './pages/Library';
import MyBooks from './pages/MyBooks';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BookDetail from './pages/BookDetail';
import UploadBook from './pages/UploadBook';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import EditBook from './pages/EditBook';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading">Loading…</div>;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Library />} />
        <Route path="book/:id" element={<BookDetail />} />
        <Route
          path="book/:id/edit"
          element={
            <AdminRoute>
              <EditBook />
            </AdminRoute>
          }
        />
        <Route
          path="upload"
          element={
            <AdminRoute>
              <UploadBook />
            </AdminRoute>
          }
        />
        <Route
          path="my-books"
          element={
            <ProtectedRoute>
              <MyBooks />
            </ProtectedRoute>
          }
        />
        <Route
          path="login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="signup"
          element={
            <GuestRoute>
              <Signup />
            </GuestRoute>
          }
        />
        <Route
          path="forgot-password"
          element={
            <GuestRoute>
              <ForgotPassword />
            </GuestRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
