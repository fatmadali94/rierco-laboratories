import React from "react";
import { FiPower, FiEdit } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/authentication/authSlice"; // update path

const UserInfoCard = ({ user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    navigate("/");
  };

  const handleEditProfile = () => {
    navigate("/profile");
  };

  if (!user) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center sm:space-x-3 space-y-3 sm:space-y-0 z-10 bg-pink px-3 py-2 rounded-lg border-black border-2">
      <img
        src={user.image}
        alt="User"
        className="w-10 h-10 rounded-lg object-cover border-2 border-black"
      />
      <div className="flex flex-col text-black text-sm">
        <span className="font-semibold">{user.name}</span>
        <span className="text-black">{user.position}</span>
      </div>
      <div className="flex space-x-2 text-black">
        <button onClick={handleEditProfile} title="Edit Profile">
          <FiEdit className="w-5 h-5 hover:text-yellow-400 transition" />
        </button>
        <button onClick={handleLogout} title="Logout">
          <FiPower className="w-5 h-5 transition" />
        </button>
      </div>
    </div>
  );
};

export default UserInfoCard;
