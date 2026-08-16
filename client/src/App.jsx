import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import CreateTrip from './pages/CreateTrip';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import Expenses from './pages/Expenses';
import Members from './pages/Members';
import Settlement from './pages/Settlement';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Layout from './components/Layout';

// Guard for protected private pages
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('tripsplit_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1E293B',
            color: '#F1F5F9',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '0.75rem',
          },
          success: { iconTheme: { primary: '#14B8A6', secondary: '#0F172A' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#0F172A' } },
        }}
      />
      <Routes>
        {/* Public auth pages */}
        <Route path="/login" element={<Login />} />
        
        {/* Main Landing landing/intro */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        
        {/* Protected trip creation */}
        <Route path="/trip/new" element={<ProtectedRoute><CreateTrip /></ProtectedRoute>} />
        
        {/* Protected user profile settings */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        
        {/* Protected trip detail layout dashboard */}
        <Route path="/trip/:id" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="add" element={<AddExpense />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="members" element={<Members />} />
          <Route path="settlement" element={<Settlement />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
