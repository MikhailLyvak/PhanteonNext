import React from "react";
import Image from "next/image";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function About() {
  return (
    <>
    <ProtectedRoute>
      <div className="bg-[#0F0F1B] pb-20">
        <div className="max-w-[1320px] w-full mx-auto px-4 flex flex-col lg:flex-row items-center gap-[136px]">
          <div className="flex-shrink-0 relative">
            <div className="relative z-10">
              <Image
                src="/About/ManinJacket.png"
                alt="ManinJacket"
                width={538}
                height={620}
                className="mx-auto"
              />
            </div>
          </div>

          <div className="max-w-[650px] text-left">
            <h1 className="text-[#D2D2FF] text-2xl md:text-5xl font-bold">
              Про мене
            </h1>
            <p className="text-white text-sm md:text-2xl mt-2">
              <span className="font-bold">Я – Ігор Порох</span>, експерт із
              фінансових ринків, трейдер і ментор із понад 10-річним досвідом.
            </p>

            <div className="bg-[#2A2A39] rounded-[15px] mt-6 p-5">
              <p className="text-white text-sm md:text-lg font-bold mb-3">
                Результати, які говорять за мене:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-white text-sm md:text-base">
                <li>
                  <span className="text-[#D2D2FF] font-bold">
                    ТОП-3 трейдер
                  </span>{" "}
                  СНД за версією BTC Awards (2017).
                </li>
                <li>
                  <span className="text-[#D2D2FF] font-bold">
                    +80% прибутку
                  </span>{" "}
                  за 2024 рік.
                </li>
                <li>
                  Запуск децентралізованого{" "}
                  <span className="text-[#D2D2FF] font-bold">маркетплейсу</span>{" "}
                  з нуля.
                </li>
                <li>
                  <span className="text-[#D2D2FF] font-bold">
                    95% точних прогнозів
                  </span>{" "}
                  за 2023 року.
                </li>
              </ul>
            </div>

            <div className="mt-10 flex items-center gap-4">
              <Image
                src="/About/MissionIcon.svg"
                alt="Mission"
                width={58}
                height={58}
                className="w-[38px] h-[38px] md:w-[58px] md:h-[58px]"
              />
              <p className="text-[#D2D2FF] text-sm md:text-2xl font-bold">
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
      </div>
      </ProtectedRoute>
    </>
  );
}
