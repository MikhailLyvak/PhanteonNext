'use client'

import InnerWhiteHeader from '@/app/components/LayoutItems/components/Header/InnerWhiteHeader'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'
import useGetQuizeDetail from '@/hooks/StudyPlatform/useGetQuizDetail'
import { LuChevronDown } from 'react-icons/lu'
import NavAccordion from '../../components/NavAccordion'
import { useQuizSubmission } from '@/hooks/StudyPlatform/usePostQuizSubmission'
import { useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import VitalisGreenButton from '@/app/components/Buttons/VitalisGreenButton'

const QuizPage = () => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const params = useParams()
  const lid = params?.lessonId
  const courseId = params?.id
  const qId = params.quizId

  const lessonId = Array.isArray(lid) ? lid[0] : lid
  const quizId = Array.isArray(qId) ? qId[0] : qId
  const { data } = useGetQuizeDetail(quizId || '')

  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()
  const { mutate, isPending, error } = useQuizSubmission()

  const handleAnswerChange = (questionId: number, answerId: number) => {
    if (!isSubmitted) {
      setSelectedAnswers(prev => ({
        ...prev,
        [questionId]: answerId,
      }))
    }
  }

  const handleSubmit = () => {
    if (!quizId) {
      console.error("No quiz id found!");
      return;
    }

    const payload = {
      quiz: quizId,
      answers: Object.entries(selectedAnswers).map(([qId, ansId]) => ({
        question: Number(qId),
        selected_answer: ansId,
      })),
    }
    mutate(payload, {
      onSuccess: (data) => {
        enqueueSnackbar("Урок пройден, вітаємо!", { variant: "success" });
        queryClient.invalidateQueries({ queryKey: ["quiz-detail", quizId] });
        setIsSubmitted(true);
      },
      onError: (error) => {
        enqueueSnackbar("Сталася помилка при відправленні тесту.", { variant: "error" });
        console.error("Submission error:", error);
      }
    });
  }

  return (
    <>
      <InnerWhiteHeader />
      <div className="pt-[120px] max-w-7xl mx-auto">
        <div className="flex flex-col max-lg:mx-4">
          {/* ✅ First Row: Breadcrumbs */}
          <div className="mt-8">
            <nav className="flex items-center" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                <li>
                  <a href="/" className="text-xs sm:text-sm font-normal hover:font-semibold text-[#D2D2FF]">
                    Головна
                  </a>
                </li>
                <li className="text-lg font-extrabold pl-1 text-[#D2D2FF]">•</li>
                <li>
                  <a href="/myCabinet/studyPlatform/" className="text-xs sm:text-sm font-normal hover:font-semibold text-[#D2D2FF]">
                    Навчальна платформа
                  </a>
                </li>
                <li className="text-lg font-extrabold pl-1 text-[#D2D2FF]">•</li>
                <li>
                  <a href={`/myCabinet/studyPlatform/${courseId}`} className="text-xs sm:text-sm font-normal hover:font-semibold text-[#D2D2FF]">
                    Курс
                  </a>
                </li>
                <li className="text-lg font-extrabold pl-1 text-[#D2D2FF]">•</li>
                <li>
                  <a href={`/myCabinet/studyPlatform/${courseId}/lesson/${lessonId}`} className="text-xs sm:text-sm font-normal hover:font-semibold text-[#D2D2FF]">
                    Урок
                  </a>
                </li>
                <li className="text-lg font-extrabold pl-1 text-[#D2D2FF]">•</li>
                <li>
                  <span className="text-xs sm:text-sm font-semibold md:ms-2 text-[#D2D2FF]">
                    Тест
                  </span>
                </li>
              </ol>
            </nav>
          </div>

          <div
            onClick={() => setIsModalOpen(!isModalOpen)}
            className={`
              max-lg:flex hidden justify-between mt-6 lg:mt-8
              bg-[#242433]
              text-white text-base font-semibold items-center p-[10px]
              ${isModalOpen ? 'rounded-t-xl' : 'rounded-xl'}
            `}
          >
            <div>Теми уроків</div>
            <div className="border-2 rounded-xl h-9 w-9 flex items-center justify-center border-white text-white">

              <LuChevronDown className={isModalOpen ? 'transition-transform -rotate-90' : 'transition-transform'} />
            </div>
          </div>

          {/* Mobile navigation */}
          <div className={isModalOpen ? 'flex' : 'hidden'}>
            {data?.nava_data && data.nava_data.length > 0 && (
              <NavAccordion modules={data.nava_data} />
            )}
          </div>
          <div className='hidden lg:flex text-[#D2D2FF] text-4xl font-semibold mt-7 mb-7'>{data?.title}</div>
          <div className="flex justify-between gap-6">
            <div className="flex flex-col w-full">

              {data?.questions && data.questions.length > 0 ? (
                <div className="flex flex-col gap-5 lg:gap-8 mt-6 lg:mt-7">
                  {data.questions.map((questionItem, index) => (
                    <div
                      key={questionItem.id}
                      className="px-2 lg:px-4 py-4 lg:py-6 bg-[#242433] shadow rounded-2xl"
                    >
                      <p className="mb-4 text-[#D2D2FF] text-xl lg:text-2xl pl-2 font-semibold">{questionItem.question}</p>
                      <div className="mt-6">
                        {questionItem.answers.map((ans) => (
                          <label
                            key={ans.id}
                            className={`
                              flex items-center gap-2 lg:gap-4 cursor-pointer rounded-lg py-1 lg:py-2 pl-2
                              ${isSubmitted && selectedAnswers[questionItem.id] === ans.id
                                ? (ans.is_correct
                                  ? "bg-green-700 opacity-50 border border-[#007E6C]"
                                  : "bg-red-700 opacity-50 border border-red-600")
                                : ""}
                            `}
                          >
                            <input
                              type="radio"
                              name={`question-${questionItem.id}`}
                              className="
                                appearance-none
                                w-6 h-6 lg:w-8 lg:h-8               /* Outer: 32×32 px */
                                bg-[#242433]
                                border-2 border-gray-700
                                rounded-lg lg:rounded-xl
                                cursor-pointer
                                relative
                                focus:ring-0
                                focus:outline-none

                                /* Pseudo-element for the 'inner square' */
                                before:content-['']
                                before:absolute
                                before:top-1/2
                                before:left-1/2
                                before:-translate-x-1/2
                                before:-translate-y-1/2
                                before:w-0
                                before:h-0
                                before:bg-transparent
                                before:transition-all

                                /* When checked, expand the 'inner square' and color it green (#78C2AD) */
                                checked:before:w-3 lg:checked:before:w-4
                                checked:before:h-3 lg:checked:before:h-4
                                checked:before:bg-[#D2D2FF]
                                checked:before:rounded-sm lg:checked:before:rounded-md
                              "
                              checked={selectedAnswers[questionItem.id] === ans.id}
                              onChange={() => handleAnswerChange(questionItem.id, ans.id)}
                            />
                            <span className='text-[#D2D2FF]text-sm lg:text-xl font-medium'>{ans.text}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className='w-full flex lg:justify-end mb-10 lg:mb-[100px]'>
                    <VitalisGreenButton
                      onClick={handleSubmit}
                      isPending={isPending}
                      disabled={isPending}
                    >
                      Завершити тест
                    </VitalisGreenButton>
                  </div>
                </div>
              ) : (
                <div>Немає питань</div>
              )}
            </div>

            <div className="hidden lg:flex mt-7">
              {data?.nava_data && data.nava_data.length > 0 && (
                <NavAccordion modules={data.nava_data} />
              )}
            </div>
          </div>

        </div>
      </div >
    </>
  )
}

export default QuizPage
