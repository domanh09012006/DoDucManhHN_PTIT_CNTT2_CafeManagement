import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Allow ADMIN and MANAGER
  if (user?.role !== 'ADMIN' && user?.role !== 'MANAGER') {
    if (user?.role === 'CASHIER') {
      return <Navigate to="/tables" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
