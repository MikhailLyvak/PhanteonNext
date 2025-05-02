'use client';

import React from "react";
import { motion } from "framer-motion";
import LoginModalFormComponent from "../components/Auth/components/Login";
import Register from "../components/Auth/components/Register";
import { useAuthModalStore } from "@/store/AuthModal/useAuthModalStore";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/UserData/useUserStore";
import { useEffect } from "react";

export default function LoginPage() {
  const { activeTab, setActiveTab } = useAuthModalStore();
  const router = useRouter();
  const { user } = useUserStore();

  useEffect(() => {
    if (user) {
      router.push("/myCabinet/studyPlatform");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#171723]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#242433] rounded-2xl p-8 w-[400px] shadow-xl"
      >
        <div className="flex justify-center space-x-6 border-b pb-4">
          <button
            className={`text-lg pb-1 ${activeTab === "login"
              ? "font-semibold text-[#D2D2FF]"
              : "text-[#58587B] hover:text-[#D2D2FF]"
              }`}
            onClick={() => setActiveTab("login")}
          >
            Вхід
          </button>
          <button
            className={`text-lg pb-1 ${activeTab === "register"
              ? "font-semibold text-[#D2D2FF]"
              : "text-[#58587B] hover:text-[#D2D2FF]"
              }`}
            onClick={() => setActiveTab("register")}
          >
            Реєстрація
          </button>
        </div>

        {activeTab === "login" ? (
          <LoginModalFormComponent />
        ) : (
          <Register />
        )}
      </motion.div>
    </div>
  );
} 