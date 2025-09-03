import React from 'react'
import Image from 'next/image'

export default function About() {
	return (
		<>
				<div className='pb-20 max-w-[1320px] w-full mx-auto'>
					<div className='my-8 ml-4 [1320px]:ml-0'>
						<nav className='flex items-center' aria-label='Breadcrumb'>
							<ol className='inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse'>
								<li>
									<a
										href='/'
										className='text-xs sm:text-sm font-normal hover:font-semibold text-[#D2D2FF]'
									>
										Головна
									</a>
								</li>
								<li className='text-lg font-extrabold pl-1 text-[#D2D2FF]'>
									•
								</li>
								<li>
									<a
										href='/About'
										className='text-xs sm:text-sm font-semibold md:ms-2 text-[#D2D2FF]'
									>
										Про нас
									</a>
								</li>
							</ol>
						</nav>
					</div>
					<div className=' px-4 flex flex-col lg:flex-row items-center gap-[136px]'>
						<div className='flex-shrink-0 relative'>
							<div className='relative z-10'>
								<Image
									src='/About/ManinJacket.png'
									alt='ManinJacket'
									width={538}
									height={620}
									className='mx-auto'
								/>
							</div>
						</div>

						<div className='max-w-[650px] text-left'>
							<h1 className='text-[#D2D2FF] text-2xl md:text-5xl font-bold'>
								Про мене
							</h1>
							<p className='text-white text-sm md:text-2xl mt-2'>
								<span className='font-bold'>Я – Ігор Порох</span>, експерт із
								фінансових ринків, трейдер і ментор із понад 10-річним досвідом.
							</p>

							<div className='bg-[#2A2A39] rounded-[15px] mt-6 p-5'>
								<p className='text-white text-sm md:text-lg font-bold mb-3'>
									Результати, які говорять за мене:
								</p>
								<ul className='list-disc pl-5 space-y-2 text-white text-sm md:text-base'>
									<li>
										<span className='text-[#D2D2FF] font-bold'>
											ТОП-3 трейдер
										</span>{' '}
										СНД за версією BTC Awards (2017).
									</li>
									<li>
										<span className='text-[#D2D2FF] font-bold'>
											+80% прибутку
										</span>{' '}
										за 2024 рік.
									</li>
									<li>
										Запуск децентралізованого{' '}
										<span className='text-[#D2D2FF] font-bold'>
											маркетплейсу
										</span>{' '}
										з нуля.
									</li>
									<li>
										<span className='text-[#D2D2FF] font-bold'>
											95% точних прогнозів
										</span>{' '}
										за 2023 року.
									</li>
								</ul>
							</div>

							<div className='mt-10 flex items-center gap-4'>
								<Image
									src='/About/MissionIcon.svg'
									alt='Mission'
									width={58}
									height={58}
									className='w-[38px] h-[38px] md:w-[58px] md:h-[58px]'
								/>
								<p className='text-[#D2D2FF] text-sm md:text-2xl font-bold'>
									Моя місія — допомогти вам стати
									<br />
									впевненими у своїх фінансах
								</p>
							</div>

            <div className="mt-10">
              <p className="text-white text-xl md:text-2xl font-bold mb-3">
                Працюю з:
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-2 bg-[#1D1D2A] rounded-2xl py-4 pl-[10px]">
                  <Image
                    src="/About/checkmark.svg"
                    alt="check"
                    width={24}
                    height={24}
                  />
                  <span className="text-white text-sm md:text-base">
                    Новачками, які хочуть зрозуміти основи інвестування.
                  </span>
                </li>
                <li className="flex items-start gap-2 bg-[#1D1D2A] rounded-2xl py-4 pl-[10px]">
                  <Image
                    src="/About/checkmark.svg"
                    alt="check"
                    width={24}
                    height={24}
                  />
                  <span className="text-white text-sm md:text-base">
                    Досвідченими інвесторами, які прагнуть стабільності й
                    зростання.
                  </span>
                </li>
                <li className="flex items-start gap-2 bg-[#1D1D2A] rounded-2xl py-4 pl-[10px]">
                  <Image
                    src="/About/checkmark.svg"
                    alt="check"
                    width={24}
                    height={24}
                  />
                  <span className="text-white text-sm md:text-base">
                    Підприємцями, що бажають зберігати капітал і примножувати
                    його.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Eduard Tiasko Section */}
        <div className="max-w-[1320px] w-full mx-auto px-4 flex flex-col lg:flex-row-reverse items-center gap-[136px]">
          <div className="flex-shrink-0 relative">
            <div className="relative z-10">
              <Image
                src="/About/EduardTiasko.png"
                alt="Eduard Tiasko"
                width={538}
                height={620}
                className="mx-auto"
              />
            </div>
          </div>

          <div className="max-w-[650px] text-left">
            <h2 className="text-[#D2D2FF] text-2xl md:text-5xl font-bold">
              Едуард Тяско
            </h2>
            
            <p className="text-white text-sm md:text-lg mt-4">
              Мій трейдерський шлях почався у 2022-му.
            </p>
            
            <p className="text-white text-sm md:text-lg mt-4">
              У голові було кіно: я з ноутом на пляжі, в одній руці коктейль, в іншій — зелене PnL, а десь на фоні — океан і свобода.
            </p>

            <div className="bg-[#2A2A39] rounded-[15px] mt-6 p-5">
              <p className="text-white text-sm md:text-lg font-bold mb-3">
                Реальність же така:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-white text-sm md:text-base">
                <li>злив за зливом</li>
                <li>постійне «ще один індикатор, і точно зайде»</li>
                <li>марафон між відеоуроками, тестами та фейковими «гуру»</li>
                <li>і фінальна стадія — повний релоад себе як трейдера</li>
              </ul>
            </div>

            <p className="text-white text-sm md:text-lg mt-6">
              <span className="text-[#D2D2FF] font-bold">Я не здався.</span>
            </p>
            
            <p className="text-white text-sm md:text-lg mt-4">
              Я вивчив ринок, збив кулаки об флети, ламав голову над психологією ціни — і в якийсь момент усе клацнуло.
            </p>

            <p className="text-white text-sm md:text-lg mt-4">
              Тепер уже значний час мій трейдинг стабільно в плюсі, без істерик і догонів.
            </p>

            <p className="text-white text-sm md:text-lg mt-4">
              І все це — стало основою для запуску проєкту <span className="text-[#D2D2FF] font-bold">PantheonX</span>.
            </p>

            <div className="bg-[#1D1D2A] rounded-2xl mt-6 p-5">
              <p className="text-[#D2D2FF] text-sm md:text-lg font-bold mb-3">
                PantheonX — це про:
              </p>
              <ul className="space-y-2 text-white text-sm md:text-base">
                <li className="flex items-start gap-2">
                  <span className="text-[#D2D2FF]">🔹</span>
                  <span>системний підхід</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D2D2FF]">🔹</span>
                  <span>реальну логіку ринку</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D2D2FF]">🔹</span>
                  <span>інструменти, які використовують великі гравці</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D2D2FF]">🔹</span>
                  <span>розбір маніпуляцій маркетмейкерів, щоб ти не був їх жертвою</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 p-5 bg-gradient-to-r from-[#2A2A39] to-[#1D1D2A] rounded-[15px] border-l-4 border-[#D2D2FF]">
              <p className="text-white text-sm md:text-lg text-center">
                Тож, якщо ти теж втомився вгадувати —<br />
                <span className="text-[#D2D2FF] font-bold">пригальмуй та ставай частиною PantheonX</span><br />
                і давай нарешті трейдити з головою, а не на емоціях
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
