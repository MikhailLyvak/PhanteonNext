import React from "react";
import Image from "next/image";
import { LuShoppingCart } from "react-icons/lu";

const VisitShopInfo = () => {
  return (
    <div className="relative max-w-7xl mb-[120px] mx-4 lg:mx-auto flex pt-6 lg:py-0 px-4 lg:px-0 flex-col-reverse lg:flex-row items-center rounded-3xl bg-gradient-to-r from-[#F2F2F2] to-[#EDEDED] overflow-hidden transition-all duration-500 ease-in-out group hover:cursor-pointer">

      {/* Image Section - Covers Background */}
      <div className="w-full lg:w-auto flex justify-center lg:justify-start lg:flex-1 lg:h-full">
        <Image
          src="/VisitShop/VisitShop.png"
          alt="Background Image"
          width={648}
          height={289}
          className="hidden lg:block w-[80%] max-w-[500px] h-auto object-cover"
        />
        <Image
          src="/VisitShop/VisitShop2.png"
          alt="Background Image"
          width={648}
          height={289}
          className="block lg:hidden w-full max-w-sm md:max-w-md h-auto object-cover"
        />
      </div>

      {/* Text & Button Section */}
      <div className="text-center lg:text-left lg:ml-auto max-w-md">
        <h3 className="text-gray-900 text-start text-xl sm:text-2xl font-bold">
          Завітай у наш Магазин за....
        </h3>
        <p className="text-gray-700 text-start text-sm sm:text-md mt-2">
          Lorem ipsum dolor sit amet consectetur. Ante eget mi vulputate neque
          placerat leo.
        </p>

        {/* Button */}
        <div className="flex justify-start mb-4 lg:mb-0">
          <button className="mt-4 py-4 px-6 bg-gradient-to-r from-[#007E6C] to-[#494949] text-white rounded-full flex items-center gap-2 text-base font-semibold group-hover:to-yellow-500 group-hover:from-yellow-500 transition-all duration-300">
            У магазин
            <LuShoppingCart className="text-white font-thin w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisitShopInfo;
