import React from "react";
import { LuCircleCheck } from "react-icons/lu";
import { LuStar } from "react-icons/lu";
const Rating = () => {
  return (
    <div className="hidden lg:flex flex-col gap-3 justify-start items-center lg:items-end">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <LuStar className="lg:text-xl text-white fill-current" />
            <LuStar className="lg:text-xl text-white fill-current" />
            <LuStar className="lg:text-xl text-white fill-current" />
            <LuStar className="lg:text-xl text-white fill-current" />
            <LuStar className="lg:text-xl text-white fill-current" />
          </div>
          <span className="text-sm lg:text-xl font-semibold">(5.0)</span>
        </div>

      </div>
      <a href="#" className="underline text-sm lg:text-base">
        Всі відгуки (56)
      </a>

      <div className="flex items-center gap-2 text-base font-semibold py-1 rounded-3xl w-fit">
        Є в наявності
        <LuCircleCheck className="text-xl text-bold" />
      </div>
    </div>
  );
};

export default Rating;
