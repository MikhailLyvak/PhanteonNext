"use client";

import React from "react";
import { useCustomTranslations } from "@/lib/contexts/translations/translations-context";
import { TKeys } from "@/i18n/t-keys";

const CartButtons = () => {
  const { t: tCommon } = useCustomTranslations(TKeys.common);

  return (
    <div className="hidden lg:flex justify-end items-end gap-2">
      <div className="flex gap-4 items-center">
        <button className="h-12 w-12 border-2 border-white rounded-xl hover:bg-white hover:text-green-700 transition text-4xl font-base">
          {"+"}
        </button>
        <span className="text-lg font-semibold">1</span>
        <button className="h-12 w-12 border-2 flex justify-center items-center pb-[7px] border-white rounded-xl hover:bg-white hover:text-green-700 transition text-4xl font-base">
          {"-"}
        </button>
        <button className="flex gap-2 px-5 py-3 bg-white rounded-full text-[#037F6A]">
          <div>{tCommon.addToCart}</div>
          <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-r rounded-full text-white text-2xl from-[#434343] to-[#007E6C]">+</div>
        </button>
      </div>
    </div>
  );
};

export default CartButtons;
