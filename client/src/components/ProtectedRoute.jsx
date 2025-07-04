import { useEffect } from 'react';
import { useLocation } from 'wouter';
import useAuthStore from '@/store/authStore';

const ProtectedRoute = ({ children, role, redirectTo = '/login' }) => {
  const { isAuthenticated, user, worker, logout } = useAuthStore();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
    } else if (role === 'client' && user?.role !== 'client') {
      setLocation('/workers');
    } else if (role === 'worker' && !worker) {
      setLocation('/login');
    }
    // Add more role-based redirects as needed
  }, [isAuthenticated, user, worker, role, setLocation]);

  if (!isAuthenticated) return null;
  if (role === 'client' && user?.role !== 'client') return null;
  if (role === 'worker' && !worker) return null;

  return children;
};

export default ProtectedRoute; 