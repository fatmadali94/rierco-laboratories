// components/LoadingScreen.jsx
import { useSelector } from "react-redux";
import LoadingTransition from "./LoadingTransition";

const LoadingScreen = () => {
  const { user } = useSelector((s) => s.auth);

  const getLoadingMessages = () => {
    const hour = new Date().getHours();
    let greeting;

    if (hour < 12) {
      greeting = "صبح بخیر";
    } else if (hour < 18) {
      greeting = "عصر بخیر";
    } else {
      greeting = "شب بخیر";
    }

    const firstName = user?.name?.split(" ")[0];
    const personalGreeting = firstName ? `${greeting}، ${firstName}` : greeting;

    return [
      personalGreeting,
      "خوش آمدید به سامانه آزمایشگاه‌ها",
      // 'در حال بارگذاری...'
    ];
  };

  return (
    <LoadingTransition
      key="landing-loader"
      messages={getLoadingMessages()}
      duration={2000} // Duration per message
      // onComplete={handleLoadingComplete}
    />
  );
};

export default LoadingScreen;
