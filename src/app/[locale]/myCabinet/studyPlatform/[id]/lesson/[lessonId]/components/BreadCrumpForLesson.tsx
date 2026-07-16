import React from 'react'

interface Props {
  courseId: string | undefined;
}

const BreadCrumpForLesson: React.FC<Props> = ({ courseId }) => {
  return (
    <div className="mt-8">
      <nav className="flex items-center" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
          <li>
            <a href="/" className='text-xs sm:text-sm font-normal hover:font-semibold md:ms-2 text-[#037F6A]'>
              Головна
            </a>
          </li>
          <li className='text-lg font-extrabold pl-1 text-[#037F6A]'>•</li>
          <li>
            <a href="/myCabinet/studyPlatform/" className='text-xs sm:text-sm font-normal hover:font-semibold md:ms-2 text-[#037F6A]'>
              Академія VB
            </a>
          </li>
          <li className='text-lg font-extrabold pl-1 text-[#037F6A]'>•</li>
          <li>
            <a href={`/myCabinet/studyPlatform/${courseId}`} className='text-xs sm:text-sm font-normal hover:font-semibold md:ms-2 text-[#037F6A]'>
              Курс
            </a>
          </li>
          <li className='text-lg font-extrabold pl-1 text-[#037F6A]'>•</li>
          <li aria-current="page">
            <span className='text-xs sm:text-sm font-semibold md:ms-2 text-[#037F6A]'>
              Урок
            </span>
          </li>
        </ol>
      </nav>
    </div>
  )
}

export default BreadCrumpForLesson
