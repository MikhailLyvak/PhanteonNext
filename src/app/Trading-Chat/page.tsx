"use client";

import { CircleCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function TradingChats() {
  const features = [
    {
      id: 1,
      text: "Жива торгівля та аналіз від нас з партнером (10+ років досвіду) та партнерів трейдерів і практиків",
    },
    {
      id: 2,
      text: "Розбір поточної ринкової ситуації без хайпу й емоцій",
    },
    {
      id: 3,
      text: "Інсайти по угодах, сценаріях і логіці дій",
    },
    {
      id: 4,
      text: "Навчання по актуальній торговій стратегії на 2026 (доступне тільки в чаті)",
    },
    {
      id: 5,
      text: "Можливість протестувати наш аналітичний скрінер першими",
    },
  ];
  const results = [
    {
      id: 1,
      text: "Менше невпевненості та метань від новин та чужих думок",
      icon: "/TradingChat/save-money-white.png",
    },
    {
      id: 2,
      text: "Чіткіше розуміння, що відбувається на ринку зараз",
      icon: "/TradingChat/save-money-white.png",
    },
    {
      id: 3,
      text: "Вміння бачити різні сценарії",
      icon: "/TradingChat/save-money-white.png",
    },
    {
      id: 4,
      text: "Спокійніші рішення: коли діяти, коли чекати, коли не входити",
      icon: "/TradingChat/save-money-white.png",
    },
    {
      id: 5,
      text: "Дисципліна в діях: менше імпульсивних угод, більше контрольованих кроків",
      icon: "/TradingChat/save-money-white.png",
    },
    {
      id: 6,
      text: "Стабільніша система роботи: аналіз → план → дія → розбір",
      icon: "/TradingChat/save-money-white.png",
    },
  ];
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-white">
      <div className="mb-12">
        <div className="w-full md:w-[40%] mb-4 rounded-lg p-[1px] bg-gradient-to-r from-[#6b6f8a] to-[#554e8f]">
          <div className="h-full w-full rounded-lg bg-gradient-to-r from-[#25273c] to-[#554e8f] p-6">
            <p className="text-white font-semibold text-xs md:text-sm">
              Для тих, хто вже в ринку — від Ігоря Пороха та команди
              трейдерів-практиків сумарно 15+ років досвіду
            </p>
          </div>
        </div>

        <div className="text-3xl md:text-7xl font-black text-[#D2D2FF] font-sans leading-tight">
          {`«Трейдинг-чат»`}
        </div>

        <div className="pt-6 w-full md:w-[80%] text-lg  md:text-3xl leading-snug">
          Канал, де приймаються зважені, обгрунтовані на сценаріях і аналізі
          рішення, а не на емоціях і новинах.
        </div>

        <div className="mt-8 mb-4 flex flex-wrap gap-6 text-xl font-bold text-[#C9A24D]">
          <div className="bg-white/5 px-4 py-2 rounded-md border border-white/10 text-sm md:text-md">
            Перший місяць — безкоштовний
          </div>
          <div className="bg-white/5 px-4 py-2 rounded-md border border-white/10 text-white text-sm md:text-md">
            Далі — $20/місяць
          </div>
          <div className="px-4 py-2 text-gray-400 font-medium text-sm md:text-md">
            * Кількість місць обмежено
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] w-[50%] bg-white/10 my-6"></div>

        <div className="text-lg md:text-2xl font-bold mb-4">Для тих, хто:</div>
        <div className="mb-6">
          <ul className="flex flex-col gap-4">
            <li className="font-medium text-xs md:text-lg flex flex-row justify-start items-start gap-3">
              <CircleCheck className="w-6 h-6 text-gray-400 mt-1 flex-shrink-0" />
              <p>
                хоче бачити, як працюють практики: розбір ринку, сценарії,
                рішення, ризик.
              </p>
            </li>
            <li className="font-medium text-xs md:text-lg flex flex-row justify-start items-start gap-3">
              <CircleCheck className="w-6 h-6 text-gray-400 mt-1 flex-shrink-0" />
              <p>
                знайомий зі спотом / ф’ючерсами / біржами / TradingView і хоче
                більше ясності в діях.
              </p>
            </li>
            <li className="font-medium text-xs md:text-lg flex flex-row justify-start items-start gap-3">
              <CircleCheck className="w-6 h-6 text-gray-400 mt-1 flex-shrink-0" />
              <p>будує зрозумілий процес: що робити, коли робити, і чому.</p>
            </li>
          </ul>
        </div>

        <div className="h-[1px] w-[50%] bg-white/10 mt-6"></div>

        <div className="flex flex-row gap-6 items-stretch w-full pt-10">
          <Link
            rel="noopener noreferrer"
            target="_blank"
            href="https://docs.google.com/forms/d/e/1FAIpQLSfpPazPoy1M5icDOYym52WFZJfkX1rbJb2X7kPBGLZZPJnYJQ/viewform?pli=1"
            className="
              flex items-center justify-center text-center flex-1 
              bg-[#C9A24D] text-black px-4 py-6 rounded-md 
              font-bold text-lg uppercase tracking-wide 
              transition-all duration-150 ease-in-out
              hover:bg-[#FACC15] hover:-translate-y-[2px] hover:shadow-xl
              active:border-b-0 active:translate-y-[6px] active:shadow-none
            "
          >
            ПОДАТИ ЗАЯВКУ
          </Link>

          <div className="self-start flex-[1.5] py-6 bg-gradient-to-r from-[#6b6f8a] to-[#554e8f] rounded-lg flex items-center justify-center">
            <p className="text-white text-md md:text-2xl italic font-medium text-center leading-tight px-6">
              Мислити, аналізувати, діяти
            </p>
          </div>
        </div>
      </div>
      <div className="h-[1px] w-full bg-white/10 my-6"></div>
      <div>
        <div className="max-w-6xl mx-auto px-4 py-10 text-white">
          <h2 className="text-xl md:text-3xl font-bold text-center mb-10">
            Усередині чату буде:
          </h2>

          <div className="flex justify-center">
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-12 w-full">
              {features.map((item) => (
                <li key={item.id} className="flex flex-row items-start gap-4">
                  <div className="flex-shrink-0 bg-[#C9A24D] text-black rounded-full w-10 h-10 md:w-16 md:h-16 flex items-center justify-center font-bold text-2xl shadow-lg">
                    {item.id}
                  </div>

                  <div className="flex flex-col flex-1 pt-1">
                    <p className="text-xs md:text-lg leading-snug text-gray-200">
                      {item.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="h-[1px] w-full bg-white/10 my-6"></div>
      <div className="max-w-6xl mx-auto px-4 py-10 text-white">
        <h2 className="text-lg md:text-3xl font-bold text-center mb-16">
          Результат після перебування в чаті:
        </h2>
        <div className="flex justify-center">
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-12 w-full">
            {results.map((item) => (
              <li
                key={item.id}
                className="relative bg-transparent rounded-lg border-white border md:border-2 p-6 pt-12 flex flex-col items-center gap-3"
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0a0a0a] rounded-full w-12 h-12 md:w-16 md:h-16 border-white border md:border-2 flex items-center justify-center">
                  <Image
                    src={item.icon}
                    alt="icon"
                    width={28}
                    height={28}
                    className="object-contain max-md:w-6 max-md:h-6"
                  />
                </div>

                <p className="font-bold text-center text-xs md:text-lg leading-snug">
                  {item.text}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="h-[1px] w-full bg-white/10 my-6"></div>
      <div className="flex justify-center items-center">
        <Link
          rel="noopener noreferrer"
          target="_blank"
          href="https://docs.google.com/forms/d/e/1FAIpQLSfpPazPoy1M5icDOYym52WFZJfkX1rbJb2X7kPBGLZZPJnYJQ/viewform?pli=1"
          className="flex-1 bg-[#C9A24D] text-black px-4 py-6 rounded-md font-bold text-lg uppercase tracking-wide 
          text-center
          transition-all duration-150 ease-in-out
          hover:bg-[#FACC15] hover:-translate-y-[2px] hover:shadow-xl
          active:border-b-0 active:translate-y-[6px] active:shadow-none"
        >
          ПОДАТИ ЗАЯВКУ
        </Link>
      </div>
    </div>
  );
}
