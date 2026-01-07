import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, Loader2 } from "lucide-react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#020617] text-slate-100">
      
      {/* Subtle Professional Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-8 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl"
      >
        {/* Logo & Header */}
        <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center p-3 mb-4 rounded-xl bg-blue-500/10 border border-blue-500/20 shadow-lg shadow-blue-500/10">
              <CreditCard className="w-8 h-8 text-blue-500" />
           </div>
           <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
             Welcome back
           </h1>
           <p className="text-slate-400 text-sm mt-2">
             Enter your credentials to access your dashboard.
           </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-3 text-slate-500" />
              <Input
                id="email"
                type="email"
                className="pl-10 bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-500/50 focus:ring-blue-500/20 placeholder:text-slate-600"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
             <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
             <div className="relative">
              <FiLock className="absolute left-3 top-3 text-slate-500" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="pl-10 pr-10 bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-500/50 focus:ring-blue-500/20 placeholder:text-slate-600"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full btn-primary mt-2 shadow-lg shadow-blue-500/20"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Sign In"}
            {/* {!loading && "Sign In"} */}
          </Button>
        </form>

        <p className="text-center text-sm mt-8 text-slate-400">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-blue-400 hover:text-blue-300 transition-colors underline decoration-blue-400/30 hover:decoration-blue-400"
          >
            Create one now
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Login;