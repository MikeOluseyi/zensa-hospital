"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await api.post("/staff/login", { email, password });
      login(res.data.token, res.data.user);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#5a5a5a] p-4">
      <div className="w-full max-w-[900px] h-[600px] bg-white rounded-[32px] shadow-2xl overflow-hidden flex">
        {/* Left Panel - Branding */}
        <div className="w-[45%] bg-[#0b7ec4] flex flex-col items-center justify-center relative">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 relative">
              <img
                src="/zensalogo.png"
                alt="Zensa Health"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const fallback = target.parentElement;
                  if (fallback) {
                    fallback.innerHTML = `
                      <div class="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                        <span class="text-3xl font-bold text-white">Z</span>
                      </div>
                    `;
                  }
                }}
              />
            </div>
            <h2 className="text-white text-2xl font-semibold tracking-wide">
              Zensa Health
            </h2>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-[55%] flex flex-col justify-center px-12 py-8">
          <div className="mb-10">
            <h1 className="text-[#0b7ec4] text-xl font-bold tracking-wider uppercase">
              Hospital Login
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="text-gray-900 text-lg font-medium">Please Login</h2>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
              <AlertCircle size={16} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username/Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-800">
                Username
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#0b7ec4] text-gray-900 px-4 py-3 outline-none focus:ring-2 focus:ring-[#0b7ec4]/20 focus:border-[#0b7ec4] transition-all placeholder:text-gray-400"
                placeholder=""
                required
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-800">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-[#0b7ec4] text-gray-900 px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-[#0b7ec4]/20 focus:border-[#0b7ec4] transition-all placeholder:text-gray-400"
                  placeholder=""
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-[#0b7ec4] hover:bg-[#0a6db0] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 font-medium transition-all flex items-center justify-center gap-2 mt-8"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log in"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}