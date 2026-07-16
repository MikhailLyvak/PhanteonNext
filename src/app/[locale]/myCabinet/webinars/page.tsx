'use client'

import MyCabinetBreadCrump from '../studyPlatform/components/BreadCrump';
import Sidebar from '../components/Sidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import WebinarsList from './components/WebinarsList';
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'

const WebinarsPage = () => {
  const { t } = useCustomTranslations(TKeys.cabinet.webinars)

  return (
    <ProtectedRoute>
      <div className="w-full">
        <div className="max-w-8xl mx-auto px-4 md:px-6">
          {/* First Row: Breadcrumbs */}
          <div className="mt-6">
            <MyCabinetBreadCrump currentPageTitle={t.breadcrumbTitle} />
          </div>

          {/* Second Row: Page Title */}
          <div className="mt-6">
            <h6 className="text-[#D2D2FF] text-xl md:text-4xl font-bold">
              {t.pageTitle}
            </h6>
          </div>

          {/* Third Row: Sidebar + Webinars */}
          <div className="flex w-full mt-8">
            {/* Sidebar - Fixed Width */}
            <div className="hidden xl:block w-[312px] shrink-0 sticky top-[140px]">
              <div className="h-fit">
                <Sidebar />
              </div>
            </div>

            {/* Right Content */}
            <div className="flex flex-col w-full sm:ml-10">
              {/* Webinars List */}
              <WebinarsList />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default WebinarsPage;
