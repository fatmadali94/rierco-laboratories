import React from "react";
import { BsFillPatchPlusFill } from "react-icons/bs";
import { FaWarehouse } from "react-icons/fa6";
import { RiStickyNoteAddFill } from "react-icons/ri";
import { GrUserWorker } from "react-icons/gr";
import { useSelector } from "react-redux";
import ActionButton from "./ActionButton"; // adjust import path if in same file

const roleAccess = {
  admin: ["ورودی_جدید", "انبار", "پذیرش", "مرکز_آزمون"],
  depository: ["ورودی_جدید", "انبار"],
  receptor: ["پذیرش"],
  tireLabrator: ["مرکز_آزمون"],
};

const ActionButtons = () => {
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.position?.toLowerCase();
  const access = roleAccess[userRole] || [];

  return (
    <div className="flex flex-col gap-5 w-full max-w-md mx-auto mt-6">
      <ActionButton
        label="ورودی جدید"
        path="ورودی_جدید"
        icon={
          <span className="w-full h-full bg-green-900 flex items-center justify-center">
            <BsFillPatchPlusFill />
          </span>
        }
        accessKey="ورودی_جدید"
        allowed={access.includes("ورودی_جدید")}
        className="w-full" // make sure your ActionButton supports className prop
      />

      <div className="grid grid-cols-3 gap-5 w-full">
        <ActionButton
          label="انبار"
          icon={
            <span className="w-full h-full bg-red-900 flex items-center justify-center">
              <FaWarehouse />
            </span>
          }
          accessKey="انبار"
          allowed={access.includes("انبار")}
        />
        <ActionButton
          label="پذیرش"
          icon={
            <span className="w-full h-full bg-[#5B1166] flex items-center justify-center">
              <RiStickyNoteAddFill />
            </span>
          }
          accessKey="پذیرش"
          allowed={access.includes("پذیرش")}
        />
        <ActionButton
          label="مرکز آزمون"
          path="مرکز_آزمون"
          icon={
            <span className="w-full h-full bg-yellow-600 flex items-center justify-center">
              <GrUserWorker />
            </span>
          }
          accessKey="مرکز_آزمون"
          allowed={access.includes("مرکز_آزمون")}
        />
      </div>
    </div>
  );
};

export default ActionButtons;
