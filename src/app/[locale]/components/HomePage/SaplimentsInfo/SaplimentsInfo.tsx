"use client";

import React from "react";
import "./SaplimentsInfo.scss";
import CardWithSVG from "./CardWithSVG/CardWithSVG";
import { useCustomTranslations } from "@/lib/contexts/translations/translations-context";
import { TKeys } from "@/i18n/t-keys";

const SaplimentsInfo = () => {
  const { t } = useCustomTranslations(TKeys.home);

  return (
    <div className="flex flex-col items-center pt-[78px] mx-4">
      <div className="flex flex-col w-full max-w-7xl">
        <h6 className="text-gray-900 text-xl sm:text-2xl font-bold  pb-[37px] text-left">
          {t.supplementsTitle}
        </h6>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
          <CardWithSVG
            srcPath="/TwelveCards/1_Pillow.svg"
            title={t.catVitaminComplexes}
          />
          <CardWithSVG
            srcPath="/TwelveCards/2_Minerals.svg"
            title={t.catMineralComplexes}
          />
          <CardWithSVG
            srcPath="/TwelveCards/3_Immune.svg"
            title={t.catImmunityAntioxidants}
          />
          <CardWithSVG
            srcPath="/TwelveCards/4_Energy.svg"
            title={t.catEnergyActivity}
          />
          <CardWithSVG
            srcPath="/TwelveCards/5_Antistress.svg"
            title={t.catAntistress}
          />
          <CardWithSVG srcPath="/TwelveCards/6_Sleep.svg" title={t.catSoundSleep} />
          <CardWithSVG
            srcPath="/TwelveCards/7_Women.svg"
            title={t.catWomensHealth}
          />
          <CardWithSVG
            srcPath="/TwelveCards/8_Men.svg"
            title={t.catMensStrength}
          />
          <CardWithSVG
            srcPath="/TwelveCards/9_55Plus.svg"
            title={t.catGoldenAge}
          />
          <CardWithSVG
            srcPath="/TwelveCards/10_Special.svg"
            title={t.catSpecializedSupport}
          />
        </div>
      </div>
    </div>
  );
};

export default SaplimentsInfo;
