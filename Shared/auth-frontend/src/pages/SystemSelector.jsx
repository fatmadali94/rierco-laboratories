import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaCar, FaFlask, FaSignOutAlt, FaUser } from "react-icons/fa";
import { logoutUser } from "../store/authSlice";
import LoadingTransition from "../components/LoadingTransition";

const SystemSelector = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((s) => s.auth);
  const [redirecting, setRedirecting] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState(null);

  const systems = [
    {
      id: "tire",
      name: "آزمایشگاه تست تایر",
      icon: FaCar,
      url: import.meta.env.VITE_TIRE_LAB_URL,
      description: "تست و کنترل کیفیت تایر، مدیریت نمونه‌ها و گزارش‌گیری",
      color: "blue",
      gradient: "from-blue-500 to-blue-700",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      hoverBorder: "hover:border-blue-500",
    },
    {
      id: "materials",
      name: "آزمایشگاه مواد و قطعات",
      icon: FaFlask,
      url: import.meta.env.VITE_MATERIALS_LAB_URL,
      description: "تست مواد اولیه، قطعات، مدیریت مالی و گزارش‌های تخصصی",
      color: "purple",
      gradient: "from-purple-500 to-purple-700",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      hoverBorder: "hover:border-purple-500",
    },
  ];

  // Filter systems based on user access
  const accessibleSystems = systems.filter((system) =>
    user?.allowedSystems?.includes(system.id)
  );

  // If user only has access to one system, redirect automatically
  useEffect(() => {
    if (accessibleSystems.length === 1 && !redirecting) {
      handleSelectSystem(accessibleSystems[0]);
    }
  }, [accessibleSystems]);

  const handleSelectSystem = (system) => {
    setRedirecting(true);
    setSelectedSystem(system.id);

    // Redirect to selected system with token
    setTimeout(() => {
      window.location.href = `${system.url}/auth-callback?token=${token}`;
    }, 500);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  // Loading state while redirecting
  if (redirecting) {
    const system = systems.find((s) => s.id === selectedSystem);

    return (
      <LoadingTransition
        messages={[`اتصال به ${system?.name}...`]}
        duration={2000}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-black">
      <div className="w-full max-w-2xl">
        <div className="glass rounded-2xl p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUser className="text-gray-400 text-xl" />
              )}
            </div>
            <div>
              <p className="text-white font-medium">{user?.name}</p>
              <p className="text-gray-400 text-sm">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-600"
          >
            <FaSignOutAlt />
            <span>خروج</span>
          </button>
        </div>
        {/* System Selection */}
        <div className="glass rounded-3xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">انتخاب سیستم</h1>
            <p className="text-gray-400">
              سیستم مورد نظر خود را برای ورود انتخاب کنید
            </p>
          </div>

          {accessibleSystems.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <FaSignOutAlt className="text-red-400 text-3xl" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                دسترسی محدود
              </h2>
              <p className="text-gray-400 mb-6">
                شما به هیچ سیستمی دسترسی ندارید. لطفاً با مدیر سیستم تماس
                بگیرید.
              </p>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-600"
              >
                خروج از حساب
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {accessibleSystems.map((system) => {
                const Icon = system.icon;
                return (
                  <button
                    key={system.id}
                    onClick={() => handleSelectSystem(system)}
                    className={`
                      w-full p-6 rounded-2xl text-right
                      ${system.bgColor} border ${system.borderColor}
                      ${system.hoverBorder}
                      hover:bg-opacity-20
                      transition-all duration-600
                      group
                    `}
                  >
                    <div className="flex items-center gap-5">
                      <div
                        className={`
                          w-16 h-16 rounded-2xl
                          bg-gradient-to-br ${system.gradient}
                          flex items-center justify-center
                          shadow-lg
                          group-hover:scale-110 transition-transform duration-600
                        `}
                      >
                        <Icon className="text-white text-2xl" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-xl mb-1">
                          {system.name}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {system.description}
                        </p>
                      </div>
                      <div className="text-gray-500 group-hover:text-white group-hover:translate-x-[-8px] transition-all duration-600">
                        ←
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Show which systems user has access to */}
          {accessibleSystems.length > 0 &&
            accessibleSystems.length < systems.length && (
              <p className="mt-6 text-center text-gray-500 text-sm">
                برای دسترسی به سایر سیستم‌ها با مدیر تماس بگیرید
              </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default SystemSelector;
