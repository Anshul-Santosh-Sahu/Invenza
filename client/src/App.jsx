import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";

// Layout
import MainLayout from "./components/layouts/MainLayout";

// Pages
import HomeRedirect from "./pages/HomeRedirect";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Invoices from "./pages/Invoices";
import InvoiceForm from "./pages/InvoiceForm";
import Settings from "./pages/Settings";
import Purchase from "./pages/Purchase";
import Analytics from "./pages/Analytics"; // <-- 1. Import Analytics

// --------------------
// Loading Spinner
// --------------------
function LoadingScreen() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mb-4"></div>
      <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-300">
        Loading...
      </h2>
    </div>
  );
}

// --------------------
// Protected Route (For Logged-in Users)
// --------------------
function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  return user ? <MainLayout /> : <Navigate to="/login" replace />;
}

// --------------------
// Public Route (For Non-Logged-in Users)
// --------------------
function PublicRoute() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

// --------------------
// Page Animation Wrapper
// --------------------
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Home Redirect */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* 2. Add Analytics Route */}
            <Route path="/analytics" element={<Analytics />} />
            
            <Route path="/customers" element={<Customers />} />
            <Route path="/products" element={<Products />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoices/new" element={<InvoiceForm />} />
            <Route path="/invoices/edit/:id" element={<InvoiceForm />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/purchase" element={<Purchase />} /> 
          </Route>

          {/* 404 Page */}
          <Route
            path="*"
            element={
              <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 text-center">
                <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                  Oops! The page you’re looking for doesn’t exist.
                </p>
                <a
                  href="/"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                >
                  Go to Home
                </a>
              </div>
            }
          />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return <AnimatedRoutes />;
}

export default App;