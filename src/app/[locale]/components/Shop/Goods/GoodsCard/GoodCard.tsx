"use client";

import React from "react";

import './GoodCard.scss'
import { useCustomTranslations } from "@/lib/contexts/translations/translations-context";
import { TKeys } from "@/i18n/t-keys";

const GoodCard = () => {
  const { t: tCommon } = useCustomTranslations(TKeys.common);
  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <img
        src="https://via.placeholder.com/150"
        alt="Good"
        className="h-32 w-32 object-cover mx-auto"
      />
      <div className="mt-2 text-center">
        <p className="text-lg font-medium">Pills Bottle Mockup</p>
        <p className="text-sm text-gray-500">
          Lorem ipsum dolor sit amet consectetur.
        </p>
        <p className="mt-2 text-xl font-semibold">{tCommon.samplePrice}</p>
        <button className="mt-2 bg-teal-500 text-white px-3 py-1 rounded-md">
          {tCommon.addToCart}
        </button>
      </div>
    </div>
  );
};

export default GoodCard;
