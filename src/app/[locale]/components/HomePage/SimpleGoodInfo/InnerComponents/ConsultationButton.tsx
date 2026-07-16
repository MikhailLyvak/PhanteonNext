"use client";

import React from "react";
import { useCustomTranslations } from "@/lib/contexts/translations/translations-context";
import { TKeys } from "@/i18n/t-keys";

const ConsultationButton = () => {
  const { t } = useCustomTranslations(TKeys.home);

  return (
    <div className="hidden lg:flex justify-start items-end">
      <button className="border border-white text-white px-5 py-2 rounded-full font-semibold flex items-center gap-2 hover:bg-white hover:text-black transition-all">
        {t.getConsultation}
      </button>
    </div>
  );
};

export default ConsultationButton;
