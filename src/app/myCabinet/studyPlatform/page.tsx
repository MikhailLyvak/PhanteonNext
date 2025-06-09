'use client'

import MyCabinetBreadCrump from './components/BreadCrump';
import CourseList from './components/CourseList';
import Sidebar from '../components/Sidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const StudyPlatformPage = () => {
  return (
    <ProtectedRoute>
      <div className="w-full">
        <div className="max-w-8xl mx-auto px-4 md:px-6">
          {/* ✅ First Row: Breadcrumbs */}
          <div className="mt-6">
            <MyCabinetBreadCrump currentPageTitle="Академія" />
          </div>

          {/* ✅ Second Row: Page Title */}
          <div className="mt-6">
            <h6 className="text-[#D2D2FF] text-xl md:text-4xl font-bold">
              Академія
            </h6>
          </div>

          {/* ✅ Third Row: Sidebar + Courses */}
          <div className="flex w-full mt-8">
            {/* Sidebar - Fixed Width */}
            <div className="hidden xl:block w-[312px] shrink-0 sticky top-[140px]">
              <div className="h-fit">
                <Sidebar />
              </div>
            </div>

            {/* Right Content */}
            <div className="flex flex-col w-full sm:ml-10">
              {/* ✅ Filters */}
              {/* <div className="flex flex-wrap gap-2 sm:gap-x-4 sm:gap-y-2 mb-8">
                <button className="h-10 px-5 bg-[#D2D2FF] text-[#171723] font-semibold sm:font-bold text-xs sm:text-base rounded-full text-nowrap">
                  Всe
                </button>
                <button className="h-10 px-5 bg-[#242433] text-[#D2D2FF] font-semibold sm:font-bold text-xs sm:text-base rounded-full text-nowrap">
                  Ваші курси
                </button>
                <button className="h-10 px-5 bg-[#242433] text-[#D2D2FF] font-semibold sm:font-bold text-xs sm:text-base rounded-full text-nowrap">
                  Фізичний розвиток
                </button>
                <button className="h-10 px-5 bg-[#242433] text-[#D2D2FF] font-semibold sm:font-bold text-xs sm:text-base rounded-full text-nowrap">
                  Ментальна рівновага
                </button>
                <button className="h-10 px-5 bg-[#242433] text-[#D2D2FF] font-semibold sm:font-bold text-xs sm:text-base rounded-full text-nowrap">
                  Духовні практики
                </button>
              </div> */}

              {/* ✅ Course List */}
              <CourseList />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default StudyPlatformPage;
