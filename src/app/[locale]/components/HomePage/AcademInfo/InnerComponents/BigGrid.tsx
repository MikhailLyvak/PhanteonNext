import Image from "next/image";
import React from "react";

const BioHack = () => {
  return (
    <div className="relative row-span-2 bg-gradient-to-r from-[#F9DA8B] via-[#F6CB5A] via-70% to-[#F6CB5A] hover:from-[#f8c67b] hover:via-[#F6CB5A] hover:to-[#F6CB5A] rounded-3xl shadow-lg transition-all duration-500 ease-in-out group overflow-hidden">
      {/* Text Content - Top Left */}
      <div className="absolute top-6 left-6">
        <h5 className="text-gray-700 text-base lg:text-3xl font-semibold">Біохакінг</h5>
        <p className="text-gray-700 text-sm lg:text-xl mt-1 font-medium">
          Вітаміни, мінерали <br />
          та Нутрицевтики
        </p>
      </div>

      {/* Image Container with Overflow Hidden */}
      <div className="flex justify-end items-center h-full overflow-hidden">
        <Image
          src="/AcademInfo/BioHack.png"
          alt="Біохакінг"
          height={584}
          width={437}
          className="object-contain transition-transform duration-300 ease-out group-hover:scale-110 pl-16 lg:pl-0 h-[310px] w-[320px] lg:h-[584px] lg:w-[437px]"
        />
      </div>

      {/* Button - Bottom Left */}
      <div className="absolute bottom-6 left-6">
        <button className="border-2 border-green-700 text-green-700 px-5 py-2 rounded-3xl text-sm lg:text-base flex items-center gap-2 group-hover:border-black group-hover:text-black transition-all duration-300">
          Дивитись все ...
        </button>
      </div>
    </div>
  );
};

export default BioHack;
