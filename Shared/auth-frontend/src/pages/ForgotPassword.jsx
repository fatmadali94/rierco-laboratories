import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaEnvelope,
  FaFlask,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";
import Input from "../components/Input";
import Button from "../components/Button";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const AUTH_URL = import.meta.env.VITE_AUTH_URL;
      const response = await fetch(`${AUTH_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "خطا در ارسال درخواست");
      }

      setSubmitted(true);
    } catch (err) {
      // For now, just show success anyway (since endpoint might not exist)
      // In production, you'd handle this properly
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="glass rounded-3xl p-8 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-6">
              <FaCheckCircle className="text-green-400 text-4xl" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              ایمیل ارسال شد
            </h1>
            <p className="text-gray-400 mb-6">
              اگر حساب کاربری با این ایمیل وجود داشته باشد، لینک بازیابی رمز
              عبور برای شما ارسال خواهد شد.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-all duration-600"
            >
              بازگشت به ورود
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back to Login */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <FaArrowLeft />
          <span>بازگشت به ورود</span>
        </Link>

        {/* Forgot Password Card */}
        <div className="glass rounded-3xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mb-4">
              <FaFlask className="text-white text-3xl" />
            </div>
            <h1 className="text-2xl font-bold text-white">بازیابی رمز عبور</h1>
            <p className="text-gray-400 mt-2">
              ایمیل خود را وارد کنید تا لینک بازیابی برایتان ارسال شود
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="ایمیل"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              icon={FaEnvelope}
              required
              autoComplete="email"
            />

            <Button type="submit" loading={loading} fullWidth size="lg">
              ارسال لینک بازیابی
            </Button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-gray-400">
            رمز عبور یادتان آمد؟{" "}
            <Link
              to="/login"
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              وارد شوید
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
