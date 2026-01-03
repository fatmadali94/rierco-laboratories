import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaBriefcase,
  FaFlask,
  FaArrowLeft,
  FaCamera,
  FaCheckCircle,
} from "react-icons/fa";
import {
  registerUser,
  clearError,
  clearRegisterSuccess,
} from "../store/authSlice";
import Input from "../components/Input";
import Button from "../components/Button";

const SignupPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, registerSuccess } = useSelector((s) => s.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
    position: "",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [validationError, setValidationError] = useState("");

  // Position options
  const positions = [
    // { value: "admin", label: "مدیر" },
    { value: "receptor", label: "پذیرش" },
    { value: "depository", label: "انباردار" },
    { value: "tireLabrator", label: "آزمایشگر آزمون تایر" },
    { value: "materialLabrator", label: "آزمایشگر آزمایشگاه مواد و قطعات" },
    { value: "finance", label: "مالی" },
    { value: "observer", label: "ارزیاب" },
  ];

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearRegisterSuccess());
    };
  }, [dispatch]);

  // Redirect to login after successful registration
  useEffect(() => {
    if (registerSuccess) {
      const timer = setTimeout(() => {
        navigate("/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [registerSuccess, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationError("");
    if (error) dispatch(clearError());
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setValidationError("رمز عبور و تکرار آن مطابقت ندارند");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setValidationError("رمز عبور باید حداقل ۶ کاراکتر باشد");
      return;
    }

    // Create FormData for file upload
    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("email", formData.email);
    submitData.append("password", formData.password);
    submitData.append("mobile", formData.mobile);
    submitData.append("position", formData.position);
    if (image) {
      submitData.append("image", image);
    }

    dispatch(registerUser(submitData));
  };

  // Success screen
  if (registerSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="glass rounded-3xl p-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-6">
              <FaCheckCircle className="text-green-400 text-4xl" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              ثبت نام با موفقیت انجام شد!
            </h1>
            <p className="text-gray-400 mb-6">
              حساب کاربری شما ایجاد شد. در حال انتقال به صفحه ورود...
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300"
            >
              ورود به حساب
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <FaArrowLeft />
          <span>بازگشت به صفحه اصلی</span>
        </Link>

        {/* Signup Card */}
        <div className="glass rounded-3xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mb-4">
              <FaFlask className="text-white text-3xl" />
            </div>
            <h1 className="text-2xl font-bold text-white">ایجاد حساب کاربری</h1>
            <p className="text-gray-400 mt-2">اطلاعات خود را وارد کنید</p>
          </div>

          {/* Error Message */}
          {(error || validationError) && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center">
              {error || validationError}
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Profile Image */}
            <div className="flex justify-center mb-4">
              <label className="cursor-pointer group">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden group-hover:border-primary-500 transition-colors">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaCamera className="text-gray-500 text-2xl group-hover:text-primary-400 transition-colors" />
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                    <FaCamera className="text-white text-sm" />
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            <Input
              label="نام و نام خانوادگی"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="نام کامل خود را وارد کنید"
              icon={FaUser}
              required
            />

            <Input
              label="ایمیل"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@example.com"
              icon={FaEnvelope}
              required
              autoComplete="email"
            />

            <Input
              label="شماره موبایل"
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="09123456789"
              icon={FaPhone}
            />

            {/* Position Select */}
            <div className="w-full">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                سمت <span className="text-red-400 mr-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaBriefcase size={20} />
                </div>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pr-10 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-gray-800">
                    انتخاب کنید
                  </option>
                  {positions.map((pos) => (
                    <option
                      key={pos.value}
                      value={pos.value}
                      className="bg-gray-800"
                    >
                      {pos.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="رمز عبور"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="حداقل ۶ کاراکتر"
              icon={FaLock}
              required
              autoComplete="new-password"
            />

            <Input
              label="تکرار رمز عبور"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="رمز عبور را مجدداً وارد کنید"
              icon={FaLock}
              required
              autoComplete="new-password"
            />

            <Button type="submit" loading={loading} fullWidth size="lg">
              ثبت نام
            </Button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-gray-400">
            قبلاً ثبت نام کرده‌اید؟{" "}
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

export default SignupPage;
