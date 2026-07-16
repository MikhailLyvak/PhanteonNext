"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import "./AcademInfo.scss";
import BioHack from "./InnerComponents/BigGrid";
import EmoInt from "./InnerComponents/EmoInt";
import SmartEat from "./InnerComponents/SmartEat";
import { useCustomTranslations } from "@/lib/contexts/translations/translations-context";
import { TKeys } from "@/i18n/t-keys";

const AcademInfo = () => {
  const { t } = useCustomTranslations(TKeys.home);

  return (
    <div className="max-w-7xl mx-auto mt-[80px] lg:mt-[118px] mb-10 lg:mb-[120px]">
      <div className="flex justify-between mx-4 lg:mx-0">
        <h6 className="text-gray-900 text-xl lg:text-4xl font-bold pb-5 lg:pb-[37px] text-left">
          {t.academyTitle}
        </h6>
        <div>
          <Link href="/myCabinet/studyPlatform" className="border-2 border-green-700 text-green-700 px-5 py-2 text-xs lg:text-base rounded-3xl flex items-center hover:bg-green-700 hover:text-white transition-colors">
            {t.allCourses}
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 lg:gap-10 mx-4 lg:mx-0">
        <BioHack />
        <EmoInt />
        <SmartEat />
      </div>
    </div>
  );
};

export default AcademInfo;
