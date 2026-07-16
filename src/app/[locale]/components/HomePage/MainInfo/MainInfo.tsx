"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image"; // ✅ If you need inline images
import { LuUserRound, LuShoppingCart } from "react-icons/lu";
import { useCustomTranslations } from "@/lib/contexts/translations/translations-context";
import { TKeys } from "@/i18n/t-keys";

import "./MainInfo.scss";

const MainInfo = () => {
  const { t: tNav } = useCustomTranslations(TKeys.nav);
  const { t: tCommon } = useCustomTranslations(TKeys.common);
  const { t } = useCustomTranslations(TKeys.home);

  return (
    <section
      className="relative w-full h-screen bg-gray-800 flex flex-col items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/Header/FullBG.jpg')" }}
    >
      <div className="absolute top-0 left-0 w-full h-[120px] border-b border-b-gray-600 bg-transparent z-20 flex items-center justify-between p-[34px]">
        <div>
          <Image
            src="/Header/Logo.svg"
            alt="Body Text"
            width={184}
            height={58}
            className="object-contain"
          />
        </div>
        <div className="flex gap-10">
          <div className="font-bold">{tNav.shopUpper}</div>
          <div className="font-bold">{t.eBalanceProUpper}</div>
          <div className="font-bold">{tNav.aboutUsUpper}</div>
          <div className="font-bold">{tNav.academyVbUpper}</div>
          <div className="font-bold">{tNav.blogUpper}</div>
        </div>
        <div className="flex gap-4">
          <div className="w-[103px] h-16 bg-white rounded-3xl flex items-center justify-center gap-4">
            <div>
              <LuShoppingCart className="text-[#037F6A] w-7 h-7" />
            </div>
            <div className="">
              <div className="w-[25px] h-[25px] rounded-3xl bg-gradient-to-r from-[#007E6C] to-[#494949] flex items-center justify-center">
                3
              </div>
            </div>
          </div>
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-r from-[#007E6C] to-[#494949] flex items-center justify-center">
            <LuUserRound className="text-white w-7 h-7" />
          </div>
          <div className="border-2 rounded-3xl w-16 h-16 flex items-center justify-center font-bold">
            UA
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl w-full px-10 flex justify-between items-center mt-10">
        <div className="max-w-xl text-white">
          <h1 className="text-4xl font-bold uppercase leading-tight">
            {tCommon.vbHeroTitle({ br: () => <br /> })}
          </h1>
          <p className="mt-4 text-lg text-gray-200">
            {tCommon.vbHeroSubtitle({ b: (chunks) => <span className="font-bold">{chunks}</span> })}
          </p>

          <div className="flex space-x-4 mt-6">
            <button className="h-12 w-12 border border-white rounded-xl hover:bg-white hover:text-green-700 transition font-bold">
              {"<"}
            </button>
            <button className="h-12 w-12 border border-white rounded-xl hover:bg-white hover:text-green-700 transition font-bold">
              {">"}
            </button>
            <div className="flex items-center font-bold">1/3</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MainInfo;
