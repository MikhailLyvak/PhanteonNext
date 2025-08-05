"use client";
import React, { useEffect } from "react";
import { useAuthModalStore } from "@/store/AuthModal/useAuthModalStore";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import LoginModalFormComponent from "./components/Login";
import Register from "./components/Register";

const LoginModal = () => {
  const { isOpen, toggleModal, activeTab, setActiveTab, setReferralId } = useAuthModalStore();

  const params = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : null;
  const referalId = params?.get("referal_id") ?? null;
  const register = params?.get("register");

  useEffect(() => {
    if (referalId && register) {
      setActiveTab("register");
      setReferralId(referalId);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl p-6 w-[400px] relative"
      >
        <button
          onClick={toggleModal}
          className="absolute top-4 right-4 text-[#48B592]"
        >
          <X size={32} />
        </button>

        <div className="flex justify-center space-x-6 border-b pb-2">
          <button
            className={`text-lg pb-1 ${activeTab === "login"
              ? "font-semibold  text-black"
              : "text-gray-500 hover:text-black"
              }`}
            onClick={() => setActiveTab("login")}
          >
            Вхід
          </button>
          <button
            className={`text-lg pb-1 ${activeTab === "register"
              ? "font-semibold  text-black"
              : "text-gray-500 hover:text-black"
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
};

export default LoginModal;