"use client";

import React from "react";
import "./Header.scss";
import HeaderNav from "./components/Header/HeaderNav";
import { useCustomTranslations } from "@/lib/contexts/translations/translations-context";
import { TKeys } from "@/i18n/t-keys";

const Header = () => {
  const { t: tCommon } = useCustomTranslations(TKeys.common);
  return (
    <header>
      <section className="relative w-full h-screen bg-gray-800 flex flex-col items-start justify-start sm:justify-center bg-cover bg-center sm:pt-0">
        <HeaderNav textColor="text-gray-200" />

        <div className="relative z-10 max-w-7xl w-full lg:-mx-40 max-sm:px-10 flex justify-center items-center mt-36 sm:mt-0">
          <div className="max-w-xl text-white">
            <h1 className="text-xl xs:text-2xl md:text-4xl font-bold uppercase leading-tight">
              {tCommon.vbHeroTitle({ br: () => <br /> })}
            </h1>
            <p className="mt-4 text-xs xs:text-sm md:text-lg text-gray-200">
              {tCommon.vbHeroSubtitle({
                b: (chunks) => <span className="font-bold">{chunks}</span>,
              })}
            </p>

            <div className="flex space-x-4 mt-6">
              <button className="h-12 w-12 border border-white rounded-xl hover:bg-white hover:text-green-700 transition font-bold">
                {"<"}
              </button>
              <button className="h-12 w-12 border border-white rounded-xl hover:bg-white hover:text-green-700 transition font-bold">
                {">"}
              </button>
              <div className="flex items-center text-sm xs:text-base font-bold">1/3</div>
            </div>
          </div>
          <div className="max-w-xl"></div>
        </div>
      </section>
    </header>
  );
};

export default Header;
