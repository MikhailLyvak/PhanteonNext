import Image from "next/image";
import React from "react";
import { LuCircleCheck } from "react-icons/lu";

const ImageAndPrice = () => {
  return (
    <div className="relative flex flex-col row-span-2 items-center h-auto">
      <div className="flex justify-center items-start relative z-10">
        <Image
          src="/GoodCardImages/DefaultGood.png"
          alt="Curcumin"
          width={250}
          height={250}
          className="object-cover drop-shadow-xl w-[138px] h-[253px] md:w-[250px] md:h-[460px]"
        />
      </div>
      <div className="flex lg:hidden mt-6 items-center gap-2 text-sm font-medium px-4 py-1 rounded-3xl w-fit">
        Є в наявності
        <LuCircleCheck size={18} className="text-bold" />
      </div>
      <div className="flex justify-center lg:mt-10 xl:mt-[103px] relative z-10">
        <div className="text-xl lg:text-3xl font-bold">880.00 ₴</div>
      </div>
      <div className="flex lg:hidden justify-center items-center gap-2">
        <button className="border-b text-white px-1 pt-2 font-semibold flex items-center hover:bg-white hover:text-black transition-all">
          Отримати консультацію
        </button>
        <div className="pt-3">
          <div className="bg-opacity-25 bg-white h-6 w-6 rounded-full text-center">
            ?
          </div>
        </div>
      </div>
      <div className="flex w-full justify-end mt-9 lg:hidden">
        <div className="flex justify-between w-full">
          <div className="flex gap-4 justify-between items-center">
            <button className="h-12 w-12 border-2 border-white flex items-center justify-center pb-[7px] rounded-xl hover:bg-white hover:text-green-700 transition text-4xl font-base">
              {"-"}
            </button>
            <span className="text-lg font-semibold">1</span>
            <button className="h-12 w-12 border-2  border-white rounded-xl hover:bg-white hover:text-green-700 transition text-4xl font-base">
              {"+"}
            </button>
          </div>
          <button className="flex gap-2 px-5 py-3 bg-white rounded-full text-[#037F6A]">
            <div>До кошика</div>
            <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-r rounded-full text-white text-2xl from-[#434343] to-[#007E6C]">+</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageAndPrice;
