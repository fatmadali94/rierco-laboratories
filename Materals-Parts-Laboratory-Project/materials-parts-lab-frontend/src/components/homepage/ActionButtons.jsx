import React from "react";
import { BsFillPatchPlusFill } from "react-icons/bs";
import { RiStickyNoteAddFill } from "react-icons/ri";
import { GrUserWorker } from "react-icons/gr";
import { FaNewspaper } from "react-icons/fa6";
import { useSelector } from "react-redux";
import { FaMoneyCheck } from "react-icons/fa6";
import ActionButton from "./ActionButton"; // adjust import path if in same file

const roleAccess = {
  admin: [
    "گزارشات",
    "پایگاه_داده",
    "آزمایشگاه_موادوقطعات",
    "پذیرش",
    "امور_مالی",
  ],
  materialLabrator: ["گزارشات", "آزمایشگاه_موادوقطعات"],
  receptor: ["گزارشات", "پذیرش"],
  finance: ["گزارشات", "امور_مالی"],
  observer: ["گزارشات", "امور_مالی"],
};

const ActionButtons = () => {
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.position?.toLowerCase();
  const access = roleAccess[userRole] || [];

  return (
    <div className="flex flex-col gap-5 w-full mx-auto max-w-4xl mt-6">
      <div className="w-full h-full grid grid-cols-2 gap-5">
        <ActionButton
          label="پذیرش"
          className={"h-48"}
          path="پذیرش"
          icon={
            <span className="w-full h-full bg-darkOrange flex items-center justify-center">
              <RiStickyNoteAddFill />
            </span>
          }
          accessKey="پذیرش"
          allowed={access.includes("پذیرش")}
        />
        <ActionButton
          label="آزمایشگاه"
          className={"h-48"}
          path="آزمایشگاه_موادوقطعات"
          icon={
            <span className="w-full h-full bg-pink flex items-center justify-center">
              <GrUserWorker />
            </span>
          }
          accessKey="آزمایشگاه_موادوقطعات"
          allowed={access.includes("آزمایشگاه_موادوقطعات")}
        />
        <ActionButton
          label="امور مالی"
          className={"h-48"}
          path="امور_مالی"
          icon={
            <span className="w-full h-full bg-darkOrange flex items-center justify-center">
              <FaMoneyCheck />
            </span>
          }
          accessKey="امور_مالی"
          allowed={access.includes("امور_مالی")}
        />
        <ActionButton
          label="گزارشات"
          className={"h-48"}
          path="گزارشات"
          icon={
            <span className="w-full h-full bg-pink flex items-center justify-center">
              <FaNewspaper />
            </span>
          }
          accessKey="گزارشات"
          allowed={access.includes("گزارشات")}
        />
        <ActionButton
          label="پایگاه داده"
          className={"h-48"}
          path="پایگاه_داده"
          icon={
            <span className="w-full h-full bg-darkOrange flex items-center justify-center">
              <BsFillPatchPlusFill />
            </span>
          }
          accessKey="پایگاه_داده"
          allowed={access.includes("پایگاه_داده")}
        />
      </div>
    </div>
  );
};

export default ActionButtons;
