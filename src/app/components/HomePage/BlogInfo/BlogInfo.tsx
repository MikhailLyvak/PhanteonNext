import React from "react";

import "./BlogInfo.scss";
import BlogCard from "../../Blog/BlogCard/BlogCard";

const BlogInfo = () => {
  const blogCards = new Array(3).fill(null);

  return (
    <div className="max-w-7xl my-10 lg:my-[120px] mx-4 xl:mx-auto">
      <div className="flex flex-col">
        <div className="flex justify-between" >
          <h6 className="text-gray-900 text-4xl font-bold lg:pb-[37px] text-left">
            Блог
          </h6>
          <div>
            <button className="border-2 border-[#037F6A] text-[#037F6A] px-5 py-2 rounded-3xl flex items-center">
              Дивитись все ...
            </button>
          </div>
        </div >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-3 mt-5">
          {blogCards.map((_, index) => (
            <div key={index}>
              <BlogCard />
            </div>
          ))}
        </div>
      </div >
    </div >
  );
};

export default BlogInfo;
