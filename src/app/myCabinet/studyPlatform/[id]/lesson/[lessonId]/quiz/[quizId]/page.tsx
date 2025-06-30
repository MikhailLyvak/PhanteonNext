'use client'

import { useParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import useGetQuizeDetail from '@/hooks/StudyPlatform/useGetQuizDetail'
import { useGetQuizResult } from '@/hooks/StudyPlatform/useGetQuizResult'
import { LuChevronDown } from 'react-icons/lu'
import NavAccordion from '../../components/NavAccordion'
import { useQuizSubmission } from '@/hooks/StudyPlatform/usePostQuizSubmission'
import { useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import VitalisGreenButton from '@/app/components/Buttons/VitalisGreenButton'

const QuizPage = () => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({})
  const [mentorComments, setMentorComments] = useState<Record<number, string>>({})
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [hasAttempted, setHasAttempted] = useState<boolean>(false)
  const [isQuizPassed, setIsQuizPassed] = useState<boolean>(false)

  const params = useParams()
  const lid = params?.lessonId
  const courseId = params?.id
  const qId = params.quizId

  const lessonId = Array.isArray(lid) ? lid[0] : lid
  const quizId = Array.isArray(qId) ? qId[0] : qId
  const { data } = useGetQuizeDetail(quizId || '')
  const { data: quizResult, isLoading: isLoadingResult } = useGetQuizResult(lessonId || '')

  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()
  const { mutate, isPending, error } = useQuizSubmission()

  // Check if quiz was already passed
  useEffect(() => {
    if (quizResult && quizResult.answers && quizResult.answers.length > 0) {
      setIsQuizPassed(true)
      setIsSubmitted(true)
      setHasAttempted(true)
      
      // Pre-fill answers from previous attempt
      const previousAnswers: Record<number, number> = {}
      const previousTextAnswers: Record<number, string> = {}
      const previousMentorComments: Record<number, string> = {}
      
      quizResult.answers.forEach((answer: { question: number; selected_answer: number | null; text_answer: string | null; mentor_comment: string | null }) => {
        if (answer.selected_answer) {
          previousAnswers[answer.question] = answer.selected_answer
        }
        if (answer.text_answer) {
          previousTextAnswers[answer.question] = answer.text_answer
        }
        if (answer.mentor_comment) {
          previousMentorComments[answer.question] = answer.mentor_comment
        }
      })
      
      setSelectedAnswers(previousAnswers)
      setTextAnswers(previousTextAnswers)
      setMentorComments(previousMentorComments)
    }
  }, [quizResult])

  const handleAnswerChange = (questionId: number, answerId: number) => {
    if (!hasAttempted) {
      setSelectedAnswers(prev => ({
        ...prev,
        [questionId]: answerId,
      }))
    }
  }

  const handleTextAnswerChange = (questionId: number, text: string) => {
    if (!hasAttempted) {
      setTextAnswers(prev => ({
        ...prev,
        [questionId]: text,
      }))
    }
  }

  const handleSubmit = () => {
    if (!quizId) {
      console.error("No quiz id found!");
      return;
    }

    if (hasAttempted) {
      enqueueSnackbar("Ви вже спробували пройти тест. Перезавантажте сторінку для повторної спроби.", { variant: "warning" });
      return;
    }

    setHasAttempted(true);

    const answers: Array<{ question: number; selected_answer?: number; text_answer?: string }> = [];

    // Add multiple choice answers
    Object.entries(selectedAnswers).forEach(([questionId, answerId]) => {
      answers.push({
        question: Number(questionId),
        selected_answer: answerId,
      });
    });

    // Add text answers
    Object.entries(textAnswers).forEach(([questionId, text]) => {
      if (text.trim()) {
        answers.push({
          question: Number(questionId),
          text_answer: text.trim(),
        });
      }
    });

    const payload = {
      quiz: quizId,
      answers: answers,
    }

    mutate(payload, {
      onSuccess: (data) => {
        enqueueSnackbar("Урок пройдено, вітаємо!", { variant: "success" });
        queryClient.invalidateQueries({ queryKey: ["quiz-detail", quizId] });
        queryClient.invalidateQueries({ queryKey: ["quiz-result", lessonId] });
        setIsSubmitted(true);
        setIsQuizPassed(true);
      },
      onError: (error) => {
        enqueueSnackbar("Сталася помилка при відправленні тесту.", { variant: "error" });
        console.error("Submission error:", error);
        // Reset attempt flag on error so user can try again
        setHasAttempted(false);
      }
    });
  }

  // Show loading while checking for existing results
  if (isLoadingResult) {
    return (
      <div className="pt-[120px] max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-[#D2D2FF] text-xl">Завантаження...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto">
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
                    Академія
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

          {/* Quiz Passed Message */}
          {isQuizPassed && (
            <div className="mt-6 p-4 bg-green-900/20 border border-green-600 rounded-lg">
              <div className="text-green-400 text-lg font-semibold mb-2">
                ✅ Тест вже пройдено
              </div>
              <div className="text-[#D2D2FF] text-sm">
                Нижче показані ваші відповіді на тест. Переходьте до наступного уроку. А на текстові відповіді ви можете подивитися коментар ментора коли їх розглянуть.
              </div>
            </div>
          )}

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
                        {questionItem.question_type === 'multiple_choice' && questionItem.answers ? (
                          questionItem.answers.map((ans) => (
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
                                  w-6 h-6 lg:w-8 lg:h-8
                                  bg-[#242433]
                                  border-2 border-gray-700
                                  rounded-lg lg:rounded-xl
                                  cursor-pointer
                                  relative
                                  focus:ring-0
                                  focus:outline-none
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
                                  checked:before:w-3 lg:checked:before:w-4
                                  checked:before:h-3 lg:checked:before:h-4
                                  checked:before:bg-[#D2D2FF]
                                  checked:before:rounded-sm lg:checked:before:rounded-md
                                "
                                checked={selectedAnswers[questionItem.id] === ans.id}
                                onChange={() => handleAnswerChange(questionItem.id, ans.id)}
                                disabled={hasAttempted}
                              />
                              <span className='text-[#D2D2FF] text-sm lg:text-xl font-medium'>{ans.text}</span>
                            </label>
                          ))
                        ) : (
                          <div className="px-2">
                            <textarea
                              className="w-full min-h-[120px] p-3 bg-[#171723] border border-gray-600 rounded-lg text-[#D2D2FF] placeholder-[#58587B] resize-none focus:outline-none focus:border-[#D2D2FF]"
                              placeholder="Введіть вашу відповідь..."
                              value={textAnswers[questionItem.id] || ''}
                              onChange={(e) => handleTextAnswerChange(questionItem.id, e.target.value)}
                              disabled={hasAttempted}
                            />
                          </div>
                        )}
                        
                        {/* Mentor Comment Display */}
                        {isQuizPassed && mentorComments[questionItem.id] && (
                          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600 rounded-lg">
                            <div className="text-blue-400 text-sm font-semibold mb-1">
                              💬 Коментар ментора:
                            </div>
                            <div className="text-[#D2D2FF] text-sm">
                              {mentorComments[questionItem.id]}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className='w-full flex lg:justify-end mb-10 lg:mb-[100px]'>
                    <VitalisGreenButton
                      onClick={handleSubmit}
                      isPending={isPending}
                      disabled={isPending || hasAttempted}
                    >
                      {hasAttempted ? 'Тест вже пройдено' : 'Завершити тест'}
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
