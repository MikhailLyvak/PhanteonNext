import React from "react";
import "./CardWithSVG.scss";

interface Props {
  srcPath: string;
  title: string;
}

const CardWithSVG: React.FC<Props> = ({ srcPath, title }) => {
  return (
    <div className="group flex flex-col justify-between items-center rounded-3xl p-3 shadow-md cursor-pointer bg-white w-[2482x] h-[248px] flex-shrink-0">
      <div className="flex items-center justify-center h-[80%]">
        <div className="w-[100px] h-[100px] flex items-center justify-center rounded-full bg-gray-100 group-hover:bg-[#26C9AE] transition-all duration-150">
          <img
            src={srcPath}
            className="icon-svg w-[40px] h-[40px] scale-[2.1]"
            alt={title}
          />
        </div>
      </div>

      <div className="mb-4">
        <p className="text-base font-semibold text-gray-900 text-center leading-tight">
          {title}
        </p>
      </div>
    </div>
  );
};

export default CardWithSVG;
