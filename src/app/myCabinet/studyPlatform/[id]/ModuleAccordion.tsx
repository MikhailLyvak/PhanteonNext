import { ModuleDetail } from '@/api/StudyPlatform/types'
import { LuCheck, LuPlus, LuLock } from "react-icons/lu";
import { FaPlus, FaMinus } from "react-icons/fa6";
import React from 'react'
import IconWithToolTip from './components/IconWithToolTip';
import Link from 'next/link';

interface Props {
  data: ModuleDetail;
  handleToggle: (id: number) => void;
  isOpen: boolean;
  index: number;
  courseId: string;
  hundleUserBuyCourse: () => void;
  is_course_mine: boolean;
  openBuyModal: () => void;
}

const ModuleAccordion: React.FC<Props> = ({ data, handleToggle, isOpen, index, courseId, hundleUserBuyCourse, is_course_mine, openBuyModal }) => {
  return (
    <div className="bg-[#242433] rounded-3xl px-6 pt-3 py-4 lg:py-7 my-3 lg:my-6">
      <div
        className="flex flex-col justify-between items-start cursor-pointer"
        onClick={() => handleToggle(data.id)}
      >
        <div className="flex justify-between w-full ">
          <div className="flex sm:mb-6 items-center flex-1 min-w-0">

            <div className={`w-6 h-6 flex items-center justify-center rounded-full ${data.module_progress === 100 ? 'bg-[#D2D2FF] text-[#242433]' : 'border-gray-500 border-[1px] text-white'}  shrink-0`}>
              <LuCheck size={18} />
            </div>


            <div className="ml-3 w-full min-w-0 overflow-hidden">
              <h3 className="text-gray-800 text-lg lg:text-2xl font-semibold flex w-10/12">
                <div className='truncate text-[#D2D2FF]'>{data.name}</div>
              </h3>
            </div>
          </div>
          {isOpen ? (
            <div className='rounded-xl h-7 w-7 lg:w-10 lg:h-10 flex items-center justify-center  text-gray-400'>
              <FaMinus size={24} />
            </div>
          ) : (
            <div className='rounded-xl h-7 w-7 lg:w-10 lg:h-10 flex items-center justify-center  text-gray-400'>
              <FaPlus size={24} />
            </div>
          )}
        </div>
        <div className="text-start text-sm lg:text-lg font-semibold text-[#D2D2FF] max-lg:mt-3">{data.lessons_count} лекції</div>
        <div className='mt-3 text-sm lg:text-base font-normal text-[#D2D2FF] max-w-6xl'>{data.description}</div>
        {data.mine ? (
          <div className="flex items-center gap-4 w-full mt-3 lg:mt-8">
            <div className="relative w-full h-2 rounded-full bg-gray-700 overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-[#D2D2FF] rounded-full transition-all"
                style={{ width: `${data.module_progress}%` }}
              />
            </div>
            <div className="text-xl font-semibold text-[#D2D2FF]">{data.module_progress}%</div>
          </div>
        ) : (
          <button
            onClick={openBuyModal}
            className="flex items-center gap-2 px-6 py-3 mt-2 lg:mt-4 bg-[#6A56E4] rounded-full text-white font-semibold text-base hover:bg-[#5846c7] transition-colors"
          >
            <span>Придбати</span>
            <LuPlus className="w-5 h-5" />
          </button>
        )}
      </div>
      {isOpen && data.lessons_list && data.lessons_list.length > 0 && (
        <div className="max-lg:my-3 my-7">
          {data.lessons_list.map((lesson, lesson_index) => {
            const isAccessible = is_course_mine || lesson.is_free;
            const LessonContent = (
              <div className="flex items-start rounded-md max-lg:mt-3 mt-7">
                <div
                  className={`w-6 h-6 flex items-center justify-center rounded-full ${lesson.is_passed ? 'bg-[#D2D2FF] text-[#242433]' : 'border-gray-500 border-[1px] text-white'
                    } ${isAccessible ? 'border-gray-500 border-[1px] text-white' : ' bg-[#D2D2FF] text-[#242433]'} shrink-0 mr-2 lg:mr-[14px]`}
                >
                  {isAccessible ? <LuCheck size={14} /> : <LuLock size={14} />}
                </div>
                <div className="text-gray-800 text-sm lg:text-lg font-semibold h-6 flex items-center min-w-0">
                  <div className="flex items-center rounded-3xl hover:underline flex-1 min-w-0">
                    <div className="hidden lg:flex text-[#D2D2FF]">
                      Тема {lesson_index + 1}.&nbsp;
                    </div>
                    <div className="flex-1 min-w-0 truncate whitespace-nowrap text-[#D2D2FF]">{lesson.name}</div>
                  </div>
                  <div className="flex gap-1 lg:gap-[10px] ml-2 lg:ml-7">
                    <IconWithToolTip
                      imgPath="/CourseDetail/MiniIcons/VideoIcon.svg"
                      title="Відео"
                    />
                    <IconWithToolTip
                      imgPath="/CourseDetail/MiniIcons/PresentationIcon.svg"
                      title="Презентація"
                    />
                    <IconWithToolTip
                      imgPath="/CourseDetail/MiniIcons/QuizeIcon.svg"
                      title="Тест"
                    />
                  </div>
                </div>
              </div>
            );

            return isAccessible ? (
              <Link
                href={`/myCabinet/studyPlatform/${courseId}/lesson/${lesson.id}`}
                key={lesson.id}
              >
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
  )
}

export default ModuleAccordion