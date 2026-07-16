import React from "react";
import { LuStar } from "react-icons/lu";

const ShortInfo = () => {
  return (
    <div className="flex lg:flex-col flex-col-reverse items-center lg:items-start mx-auto max-w-md">
      <div className="flex-col w-full lg:hidden items-center">
        <div className="flex items-center justify-center gap-1">
          <div className="flex gap-1">
            <LuStar className="lg:text-xl text-white fill-current" />
            <LuStar className="lg:text-xl text-white fill-current" />
            <LuStar className="lg:text-xl text-white fill-current" />
            <LuStar className="lg:text-xl text-white fill-current" />
            <LuStar className="lg:text-xl text-white fill-current" />
          </div>
          <span className="text-sm lg:text-xlfont-semibold">(5.0)</span>
        </div>
        <div className="flex justify-center "><a href="#" className="underline text-sm">
          Всі відгуки (56)
        </a></div>
      </div>
      <div className="px-7 lg:px-0">
        <h5 className="text-xl lg:text-4xl font-bold mb-4 text-center lg:text-start leading-tight mt-3 lg:mt-0">Curcumin</h5>
        <p className="text-sm lg:text-lg text-center lg:text-start leading-relaxed mb-0 lg:mb-6 line-clamp-3 lg:line-clamp-6">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Laborum,
          aliquid ex aliquam asperiores eaque pariatur et ab sequi voluptatibus
          fugit minima!
        </p>
      </div>
      <span className="bg-gray-200 bg-opacity-25 px-4 py-1 rounded-3xl text-xs lg:text-sm font-semibold w-fit">
        30 мл
      </span>
    </div>
  );
};

export default ShortInfo;
