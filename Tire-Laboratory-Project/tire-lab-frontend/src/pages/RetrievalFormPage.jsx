import RetrievalForm from "../components/RetrievalForm";
import { useDispatch, useSelector } from "react-redux";
import UserInfoCard from "../components/UserInfoCard";
import { SiHomeadvisor } from "react-icons/si";
import { Link } from "react-router-dom";

const RetrievalFormPage = () => {
  const user = useSelector((state) => state.auth.user);
  return (
    <div className="bg-neutral-950 min-h-[100dvh] relative p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col">
      <div className="fixed inset-0 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>

      <div className="relative mx-auto w-full flex-1 flex flex-col">
        <header className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl mt-4 md:text-3xl font-bold text-[#83358F] animate-neon-purple-limited mb-2 text-center sm:text-left">
            پذیرش آزمون تایر
          </h1>

          <Link
            to="/Homepage"
            className="absolute left-1/2 transform -translate-x-1/2 text-5xl mt-8 text-[#83358F] hover:text-purple-300 transition-colors"
            title="بازگشت به خانه"
          >
            <SiHomeadvisor />
          </Link>

          <UserInfoCard user={user} />
        </header>

        <div>
          <RetrievalForm />
        </div>
      </div>
    </div>
  );
};

export default RetrievalFormPage;
