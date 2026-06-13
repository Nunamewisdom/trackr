import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import AddApplication from './pages/AddApplication';
import Companies from './pages/Companies';
import Interviews from './pages/Interviews';
import Reminders from './pages/Reminders';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />
          <Route path="/applications" element={
            <PrivateRoute><Applications /></PrivateRoute>
          } />
          <Route path="/applications/new" element={
            <PrivateRoute><AddApplication /></PrivateRoute>
          } />
          <Route path="/companies" element={
            <PrivateRoute><Companies /></PrivateRoute>
          } />
          <Route path="/interviews" element={
            <PrivateRoute><Interviews /></PrivateRoute>
          } />
          <Route path="/reminders" element={
            <PrivateRoute><Reminders /></PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;