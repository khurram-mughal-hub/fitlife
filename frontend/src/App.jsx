import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ResubmitApplication from './pages/ResubmitApplication';
import Signup from './pages/Signup';

import StaffDashboard from './pages/StaffDashboard';

const PrivateRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/staff-dashboard"
        element={
          <PrivateRoute>
            <StaffDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/resubmit"
        element={
          <PrivateRoute>
            <ResubmitApplication />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default App;
