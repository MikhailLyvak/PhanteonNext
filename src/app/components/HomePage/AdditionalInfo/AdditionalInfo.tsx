import React from "react";
import BodyCard from "./Cards/BodyCard";
import MindCard from "./Cards/MindCard";
import SpiritCard from "./Cards/SpiritCard";

const AdditionalInfo = () => {
  return (
    <div className="bg-white flex flex-col items-center justify-center rounded-t-3xl py-[101px] -mt-7 relative z-10">
      <p className="text-gray-200 text-2xl xs:text-4xl md:text-6xl lg:text-8xl font-extrabold mb-9">
        VITALIS BALANCE
      </p>
      <h3 className="text-black text-sm xs:text-lg sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-5">ЩО ТАКЕ VB?</h3>
      <p className="text-center text-xs xs:text-sm text-gray-700 max-w-xl px-2 md:px-0">
        Ми прагнемо поєднати найкраще з природи та сучасних технологій, щоб
        допомогти вам досягти гармонії у трьох аспектах: фізичному, ментальному
        та духовному
      </p>

      {/* Enable horizontal scrolling only for the 3 cards */}
      <div className="w-full max-w-7xl lg:gap-4 gap-6 flex flex-col lg:flex-row items-center justify-center mt-5 lg:mt-[50px] xl:mt-[75px]">
        <BodyCard />
        <MindCard />
        <SpiritCard />
      </div>
    </div>
  );
};

export default AdditionalInfo;
