import { Course } from "@/api/StudyPlatform/types";
import React from "react";
import { LuCheck } from "react-icons/lu";
import Link from "next/link";


const CourseCard = ({ course }: { course: Course }) => {
  return (
    <Link className="flex max-sm:flex-col bg-[#242433] rounded-3xl shadow-sm items-start w-full overflow-hidden" href={`/myCabinet/studyPlatform/${course.id}`}>
      <div className="w-60 max-sm:w-full h-60 p-4">
        <div className="w-full h-full aspect-square rounded-3xl overflow-hidden">
          <img
            src={course.image}
            alt={course.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Content Container */}
      <div className={`flex flex-col ${!course.mine && 'justify-between'} w-full h-full px-6 sm:pt-[34px] pb-4`}>

        <div className="">
          <div className="flex justify-between">
            <div className="flex mb-4 sm:mb-6 items-center flex-1 min-w-0">
              <div className="w-6 h-6 flex items-center justify-center rounded-full border-gray-500 border-[1px] text-gray-500 shrink-0">
                <LuCheck size={12} className="font-semibold" />
              </div>
              <div className="ml-3 w-full min-w-0 overflow-hidden">
                <h3 className="font-semibold sm:font-bold text-[#D2D2FF] text-lg truncate">{course.name}</h3>
              </div>
            </div>
            <div className="hidden sm:flex ">
              {course.is_discount ? (
                <div className="flex flex-col items-end">
                  <span className="text-white line-through text-sm">
                    {course.price} ₴
                  </span>
                  <span className="text-white font-bold text-xl">
                    {course.sell_price} ₴
                  </span>
                </div>
              ) : (
                <span className="text-white font-bold text-xl">
                  {course.price} ₴
                </span>
              )}
            </div>
          </div>

          <p className="text-white text-lg font-semibold mb-3">{course.lessons_amount} лекцій</p>

          <p className="text-white text-sm line-clamp-5 sm:line-clamp-2 overflow-hidden text-ellipsis whitespace-pre-wrap">
            {course.description}
          </p>
        </div>

        {/* ✅ Ensure button stays at the bottom */}
        <div className="flex mt-4 sm:mt-0 ">
          {course.mine === true ? (
            <div className="flex items-center gap-4 w-full mt-8">
              <div className="relative w-full h-2 rounded-full bg-gray-700 overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-[#D2D2FF] rounded-full transition-all"
                  style={{ width: `${course.course_progress}%` }}
                />
              </div>
              <div className="text-xl font-semibold text-white">{course.course_progress}%</div>
            </div>

          ) : (
            <div className="flex justify-between w-full">
              <button className="bg-[#6A56E4] text-white px-8 py-2 rounded-3xl text-base font-semibold">
                Детальніше
              </button>
              <div className="flex sm:hidden ">
                {course.is_discount ? (
                  <div className="flex flex-col items-end">
                    <span className="text-white line-through text-xs sm:text-sm">
                      {course.price} ₴
                    </span>
                    <span className="text-white font-bold text-lg sm:text-xl">
                      {course.sell_price} ₴
                    </span>
                  </div>
                ) : (
                  <span className="text-white font-bold text-lg sm:text-xl">
                    {course.price} ₴
                  </span>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </Link >
  );
};

export default CourseCard;
