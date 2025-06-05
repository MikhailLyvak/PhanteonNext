import { NavModule } from '@/api/StudyPlatform/types';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useState } from 'react'
import { LuCheck, LuLock } from "react-icons/lu";
import { FaPlus, FaMinus } from "react-icons/fa6";

interface NavAccordionProps {
  modules: NavModule[];
}

const NavAccordion: React.FC<NavAccordionProps> = ({ modules }) => {
  const params = useParams();
  const courseIdParam = params?.id;
  const lessonIdParam = params?.lessonId;

  const courseId = Array.isArray(courseIdParam) ? courseIdParam[0] : courseIdParam || '';
  const lessonId = Array.isArray(lessonIdParam) ? lessonIdParam[0] : lessonIdParam || '';

  const getInitialOpenModule = (): number | null => {
    const currentLessonId = parseInt(lessonId);
    for (const mod of modules) {
      if (mod.lessons.some((lesson) => lesson.id === currentLessonId)) {
        return mod.id;
      }
    }
    return null;
  };
  const [openModule, setOpenModule] = useState<number | null>(getInitialOpenModule);



  const toggleModule = (id: number) => {
    setOpenModule((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full max-w-[424px] bg-[#242433] max-h-[466px] rounded-b-3xl lg:rounded-3xl shadow-xl p-3">
      {modules.map((module) => (
        <div key={module.id} className="mb-2">
          {/* Module Header */}
          <button
            onClick={() => toggleModule(module.id)}
            className={`flex items-center justify-between w-full pt-3 px-2 ${openModule === module.id ? 'bg-[#FFFFFF12] rounded-t-xl' : ''
              }`}
          >
            {/* Left section: icon + text */}
            <div className="flex items-center flex-grow overflow-hidden">
              <div
                className={`w-7 h-7 flex items-center justify-center rounded-full ${module.passed ? 'bg-[#D2D2FF] text-[#242433]' : 'border-gray-500 border-[1px] text-white'
                  } text-white flex-shrink-0 mr-2 lg:mr-[14px]`}
              >
                <LuCheck />
              </div>

              {/* Text - truncate if too long */}
              <span className="text-[#D2D2FF font-semibold text-lg truncate mr-4">
                {module.name}
              </span>
            </div>

            {/* Right section: chevron - prevent shrinking */}
            {openModule === module.id ? (
              <div className='rounded-xl h-7 w-7 lg:w-10 lg:h-10 flex items-center justify-center  text-white'>
                <FaMinus size={24} />
              </div>
            ) : (
              <div className='rounded-xl h-7 w-7 lg:w-10 lg:h-10 flex items-center justify-center  text-white'>
                <FaPlus size={24} />
              </div>
            )
            }

          </button>


          {/* Module Lessons (expanded) */}
          {openModule === module.id && (
            <div className={`px-2 pb-4 space-y-2 ${openModule === module.id && 'bg-[#FFFFFF12] rounded-b-xl pt-3'}`}>
              {module.lessons.map((lesson) => {
                const LessonContent = (
                  <div className="flex items-center pl-1 pt-[6px]">
                    {/* Checkmark or Lock icon for each lesson */}
                    <div className={`w-5 h-5 flex items-center justify-center rounded-full ${lesson.passed ? 'bg-[#D2D2FF] text-[#242433]' : lesson.is_accessible ? 'border-gray-500 border-[1px] text-white' : 'bg-[#D2D2FF] text-[#242433]'} text-white shrink-0 mr-2 lg:mr-[19px]`}>
                      {lesson.is_accessible ? <LuCheck className='w-3 h-3' /> : <LuLock className='w-3 h-3' />}
                    </div>
                    <span className={`text-[#D2D2FF font-semibold text-sm ${lesson.id === +lessonId && 'underline'} ${lesson.is_accessible ? 'hover:underline' : ''}`}>{lesson.name}</span>
                  </div>
                );

                return lesson.is_accessible ? (
                  <Link href={`/myCabinet/studyPlatform/${courseId}/lesson/${lesson.id}`} key={lesson.id}>
                    {LessonContent}
                  </Link>
                ) : (
                  <div key={lesson.id} className="cursor-not-allowed opacity-70">
                    {LessonContent}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))
      }
    </div >
  );
};

export default NavAccordion;
