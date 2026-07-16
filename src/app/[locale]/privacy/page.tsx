import { setRequestLocale } from 'next-intl/server'
import { getCustomTranslations } from '@/lib/contexts/translations/translations-server'
import { TKeys } from '@/i18n/t-keys'

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const { t } = await getCustomTranslations(TKeys.privacy)
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-2 text-[#D2D2FF]">
        {t.title}
      </h1>
      <p className="text-sm text-[#58587B] mb-8">
        {t.lastUpdated}
      </p>

      <div className="prose max-w-none text-[#98A0B3] leading-relaxed space-y-6">
        <section>
          <p>{t.intro}</p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-semibold text-[#D2D2FF] mb-3">
            {t.section1Title}
          </h2>
          <p>{t.section1Intro}</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong className="text-[#D2D2FF]">{t.section1Label1}</strong>{' '}
              {t.section1Text1}
            </li>
            <li>
              <strong className="text-[#D2D2FF]">{t.section1Label2}</strong>{' '}
              {t.section1Text2}
            </li>
            <li>
              <strong className="text-[#D2D2FF]">{t.section1Label3}</strong>{' '}
              {t.section1Text3}
            </li>
            <li>
              <strong className="text-[#D2D2FF]">{t.section1Label4}</strong>{' '}
              {t.section1Text4}
            </li>
            <li>
              <strong className="text-[#D2D2FF]">{t.section1Label5}</strong>{' '}
              {t.section1Text5}
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-semibold text-[#D2D2FF] mb-3">
            {t.section2Title}
          </h2>
          <p>{t.section2Intro}</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>{t.section2Item1}</li>
            <li>{t.section2Item2}</li>
            <li>{t.section2Item3}</li>
            <li>{t.section2Item4}</li>
            <li>{t.section2Item5}</li>
            <li>{t.section2Item6}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-semibold text-[#D2D2FF] mb-3">
            {t.section3Title}
          </h2>
          <p>{t.section3Body}</p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-semibold text-[#D2D2FF] mb-3">
            {t.section4Title}
          </h2>
          <p>{t.section4Body}</p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-semibold text-[#D2D2FF] mb-3">
            {t.section5Title}
          </h2>
          <p>{t.section5Intro}</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>{t.section5Item1}</li>
            <li>{t.section5Item2}</li>
            <li>{t.section5Item3}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-semibold text-[#D2D2FF] mb-3">
            {t.section6Title}
          </h2>
          <p>{t.section6Body}</p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-semibold text-[#D2D2FF] mb-3">
            {t.section7Title}
          </h2>
          <p>{t.section7Intro}</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>{t.section7Item1}</li>
            <li>{t.section7Item2}</li>
            <li>{t.section7Item3}</li>
            <li>{t.section7Item4}</li>
            <li>{t.section7Item5}</li>
            <li>{t.section7Item6}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-semibold text-[#D2D2FF] mb-3">
            {t.section8Title}
          </h2>
          <p>{t.section8Body}</p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-semibold text-[#D2D2FF] mb-3">
            {t.section9Title}
          </h2>
          <p>{t.section9Body}</p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-semibold text-[#D2D2FF] mb-3">
            {t.section10Title}
          </h2>
          <p>
            {t.section10Body}{' '}
            <a
              href="mailto:support@pantheonx.club"
              className="text-[#6A56E4] hover:underline"
            >
              support@pantheonx.club
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
