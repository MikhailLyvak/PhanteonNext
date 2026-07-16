import React from "react";
import ShortInfo from "./InnerComponents/ShortInfo";
import ImageAndPrice from "./InnerComponents/ImageAndPrice";
import Rating from "./InnerComponents/Rating";
import ConsultationButton from "./InnerComponents/ConsultationButton";

import "./SimpleGoodInfo.scss";
import CartButtons from "./InnerComponents/CartButtons";
import Image from "next/image";

const SimpleGoodInfo = () => {
  return (
    <div className="relative bg-cover bg-center rounded-3xl px-6 py-6 xl:pb-[120px] xl:pt-[204px] text-white xl:mx-4 my-9 lg:my-20 md:py-20"
      style={{ backgroundImage: "url('/GoodCardImages/BigBG.jpg')" }}>
      <div className="relative">
        <div className="absolute lg:-top-40 inset-0 flex items-center justify-center">
          <Image
            src="/OpacityLogoGray.png"
            alt="Background Logo"
            width={798}
            height={756}
            className="object-contain w-[315px] h-[294px] md:w-[598px] md:h-[556px]"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 grid-flow-row max-w-7xl mx-auto">
          <ShortInfo />
          <ImageAndPrice />
          <Rating />
          <ConsultationButton />
          <CartButtons />
        </div>
      </div>
    </div>

  );
};

export default SimpleGoodInfo;
