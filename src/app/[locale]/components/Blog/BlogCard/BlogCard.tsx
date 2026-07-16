import React from "react";

import "./BlogCard.scss";
import Image from "next/image";

const BlogCard = () => {
  return (
    <article className="group h-full overflow-hidden rounded-3xl border-2 border-gray-200 border-opacity-60 transition-all ease-in-out duration-500 shadow-lg hover:shadow-2xl">
      <Image
        src="/Blog/BlogImage1.jpg"
        width={200}
        height={200}
        alt="Blog"
        className="w-full transform object-cover object-center mb-[28px]"
      />

      <span className="text-white text-xs font-semibold mt-[28px] ml-[16px] px-2.5 py-0.5 rounded-full bg-[#48B592]">
        Тіло
      </span>
      <div className="py-4 px-6">
        <p className="line-clamp-6 mb-3 ml-[-5px] cursor-pointer overflow-hidden leading-relaxed text-gray-500">
          Lorem ipsum dolor sit amet consectetur. Ante eget mi vulputate neque
          placerat leo.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between px-6 pt-1 pb-4">
        <div className="mt-1">
          <button className="border-2 border-[#037F6A] text-[#037F6A] px-5 py-2 rounded-3xl flex items-center group-hover:border-black group-hover:text-black transition-all duration-300">
            Читати ...
          </button>
        </div>
        <div className="flex flex-wrap text-sm text-gray-500">
          <span className="mr-1">30 січня 2025</span>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
