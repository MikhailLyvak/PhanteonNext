import Image from "next/image";
import React from "react";

const EmoInt = () => {
  return (
    <div className="relative bg-gradient-to-r lf from-[#F2F2F2] to-[#EDEDED] hover:from-[#dfdede] hover:to-[#EDEDED] rounded-3xl shadow-lg transition-all duration-500 ease-in-out group overflow-hidden">
      <div className="absolute top-6 left-6">
        <h5 className="text-gray-700 text-base lg:text-2xl font-semibold  line-clamp-2 max-sm:max-w-36">
          Емоційний інтелект
        </h5>
      </div>

      <div className="flex justify-end items-center h-full overflow-hidden">
        <Image
          src="/AcademInfo/EmoInt.png"
          alt="Тіло"
          height={180}
          width={269}
          className="object-contain scale-125 transition-transform duration-300 h-[160px] w-[230px] lg:h-[180px] lg:w-[269px] ease-out group-hover:scale-[1.35]"
        />
      </div>

      <div className="absolute bottom-6 left-6">
        <button className="border-2 border-green-700 text-sm lg:text-base  text-green-700 px-5 py-2 rounded-3xl flex items-center gap-2 group-hover:border-black group-hover:text-black transition-all duration-300">
          Дивитись все ...
        </button>
      </div>
    </div>
  );
};

export default EmoInt;
