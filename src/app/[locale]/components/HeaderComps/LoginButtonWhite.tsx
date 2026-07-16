"use client";

import { useAuthModalStore } from "@/store/AuthModal/useAuthModalStore";
import { useDrawerStore } from "@/store/Nav/useDrawerStore";
import { useUserStore } from "@/store/UserData/useUserStore";
import { LuUserRound } from "react-icons/lu";

const LoginButtonWhite = () => {
  const { toggleModal } = useAuthModalStore();
  const { toggleDrawer } = useDrawerStore();
  const { user } = useUserStore();

  return (
    <div
      className="w-16 h-16 rounded-3xl bg-gray-200 flex items-center justify-center cursor-pointer hover:shadow-3xl"
      onClick={() => {
        if (user) {
          toggleDrawer();
        } else {
          toggleModal();
        }
      }}

    >
      <LuUserRound className="text-gray-700 w-7 h-7" />
    </div>
  );
};

export default LoginButtonWhite;
