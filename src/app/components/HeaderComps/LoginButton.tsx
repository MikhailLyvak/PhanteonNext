"use client";

import { useAuthModalStore } from "@/store/AuthModal/useAuthModalStore";
import { useDrawerStore } from "@/store/Nav/useDrawerStore";
import { useMainDrawerStore } from "@/store/Nav/useMainDrawerStore";
import { useUserStore } from "@/store/UserData/useUserStore";
import { LuUserRound } from "react-icons/lu";

interface Props {
  isSideBar?: boolean;
}

const LoginButton: React.FC<Props> = ({ isSideBar = false }) => {
  const { toggleModal } = useAuthModalStore();
  const { toggleDrawer } = useDrawerStore();
  const { closeMainDrawer } = useMainDrawerStore();
  const { user } = useUserStore();

  return (
    <div
      className={`${isSideBar ? 'w-12 h-12' : 'w-12 h-12 md:w-16 md:h-16'} rounded-xl bg-[#242433] flex items-center justify-center cursor-pointer hover:shadow-3xl`}
      onClick={() => {
        if (user) {
          toggleDrawer();
          closeMainDrawer();
        } else {
          toggleModal();
          closeMainDrawer();
        }
      }}

    >
      <LuUserRound className="text-[#D2D2FF] w-7 h-7" />
    </div>
  );
};

export default LoginButton;
