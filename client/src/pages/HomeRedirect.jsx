import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

function HomeRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        if (user) navigate('/dashboard', { replace: true });
        else navigate('/login', { replace: true });
      }, 1500); // small delay for smooth transition
      return () => clearTimeout(timer);
    }
  }, [user, loading, navigate]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <Loader2 className="h-12 w-12 animate-spin mb-4" />
        <h2 className="text-2xl font-semibold tracking-wide">Redirecting you...</h2>
        <p className="text-sm text-white/80 mt-2">
          Please wait while we prepare your dashboard
        </p>
      </motion.div>
    </div>
  );
}

export default HomeRedirect;