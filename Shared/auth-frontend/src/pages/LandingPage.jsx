import { Link, useSearchParams } from "react-router-dom";
import {
  FaFlask,
  FaSignInAlt,
  FaUserPlus,
  FaCar,
  FaCogs,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { TbAlertHexagon } from "react-icons/tb";
import LoadingTransition from "../components/LoadingTransition";
import MouseTrackingCharacter from "../components/MouseTrackingCharacter";
const LandingPage = () => {
  const { token, user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const hasShownToast = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  const showInvalidToast = (
    msg = "شما هنوز اجازه ورود به آزمایشگاه‌ها را ندارید"
  ) =>
    toast.custom(
      () => (
        <div
          dir="rtl"
          className="flex items-center gap-2 px-4 py-3 text-orange-500"
        >
          <TbAlertHexagon className="w-6 h-6 animate-bounce motion-reduce:animate-none" />
          <span className="text-sm sm:text-base opacity-80">{msg}</span>
        </div>
      ),
      {
        duration: 20000,
        id: "no-permissions-toast",
      }
    );
  //greeting on loading page
  // const getLoadingMessages = () => {
  //   const hour = new Date().getHours();
  //   let greeting;

  //   if (hour < 12) {
  //     greeting = "صبح بخیر";
  //   } else if (hour < 18) {
  //     greeting = "عصر بخیر";
  //   } else {
  //     greeting = "شب بخیر";
  //   }

  //   const firstName = user?.name?.split(" ")[0];
  //   const personalGreeting = firstName ? `${greeting}، ${firstName}` : greeting;

  //   return [
  //     personalGreeting,
  //     "خوش آمدید به سامانه آزمایشگاه‌ها",
  //     // 'در حال بارگذاری...'
  //   ];
  // };

  // // Force loading animation on every mount
  // useEffect(() => {
  //   // Reset loading to true when component mounts
  //   setIsLoading(true);

  //   // This will let LoadingTransition complete its full duration
  //   // The onComplete callback will set it to false
  // }, []); // Empty dependency array = runs once on mount

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "no_permissions" && !hasShownToast.current) {
      hasShownToast.current = true;
      // Show toast immediately
      showInvalidToast("شما هنوز اجازه ورود به آزمایشگاه‌ها را ندارید");

      // Clean up URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("error");
      setSearchParams(newParams, { replace: true });
    }
  }, [isLoading, searchParams, setSearchParams]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    navigate("/login");
  };

  // const handleLoadingComplete = () => {
  //   setIsLoading(false);
  // };

  // if (isLoading) {
  //   return (
  //     <LoadingTransition
  //       key="landing-loader"
  //       messages={getLoadingMessages()}
  //       duration={1500} // Duration per message
  //       onComplete={handleLoadingComplete}
  //     />
  //   );
  // }

  return (
    <div className="min-h-screen flex flex-col bg-[#000000]">
      {/* Header */}
      <header className="p-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {token && (
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
              >
                خروج از حساب
              </button>
            )}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <FaFlask className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">ریرکو</h1>
              <p className="text-gray-400 text-xs">سامانه آزمایشگاه‌ها</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {token ? (
              <Link
                to="/select-system"
                className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-all duration-600"
              >
                ورود به سیستم
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-2 text-gray-300 hover:text-white transition-colors duration-600"
                >
                  ورود
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-all duration-600"
                >
                  ثبت نام
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* Floating Icons */}
          <div className="relative mb-12">
            <div className="absolute -top-10 right-1/4 animate-float">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm border border-blue-500/30 flex items-center justify-center">
                <FaCar className="text-blue-400 text-2xl" />
              </div>
            </div>
            <div
              className="absolute -top-5 left-1/4 animate-float"
              style={{ animationDelay: "2s" }}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm border border-purple-500/30 flex items-center justify-center">
                <FaCogs className="text-purple-400 text-2xl" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
            سامانه مدیریت
            <span className="gradient-text block mt-2">
              آزمایشگاه‌های ریرکو
            </span>
          </h1>
          <MouseTrackingCharacter />

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
            مدیریت یکپارچه آزمایشگاه تست تایر و آزمایشگاه مواد و قطعات با امکان
            دسترسی سریع و امن به تمامی بخش‌ها
          </p>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
            <div className="glass rounded-2xl p-6 text-right hover:bg-white/20 transition-all duration-600">
              <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                <FaCar className="text-blue-400 text-2xl" />
              </div>
              <h3 className="text-white font-bold text-xl mb-2">
                آزمایشگاه تست تایر
              </h3>
              <p className="text-gray-400">
                تست و کنترل کیفیت تایر، مدیریت نمونه‌ها، گزارش‌گیری و آرشیو
                نتایج
              </p>
            </div>

            <div className="glass rounded-2xl p-6 text-right hover:bg-white/20 transition-all duration-600">
              <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                <FaFlask className="text-purple-400 text-2xl" />
              </div>
              <h3 className="text-white font-bold text-xl mb-2">
                آزمایشگاه مواد و قطعات
              </h3>
              <p className="text-gray-400">
                تست مواد اولیه، قطعات، مدیریت مالی و گزارش‌های تخصصی
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {token ? (
              <Link
                to="/select-system"
                className="px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-600 flex items-center gap-2"
              >
                <FaSignInAlt />
                ورود به سیستم
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-600 flex items-center gap-2"
                >
                  <FaSignInAlt />
                  ورود به حساب
                </Link>
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold text-lg transition-all duration-600 flex items-center gap-2"
                >
                  <FaUserPlus />
                  ایجاد حساب جدید
                </Link>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} شرکت ریرکو - تمامی حقوق محفوظ است</p>
      </footer>
    </div>
  );
};

export default LandingPage;
