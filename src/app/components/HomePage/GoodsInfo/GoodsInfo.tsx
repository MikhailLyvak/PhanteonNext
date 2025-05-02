"use client";

import React, { useRef } from "react";
import dynamic from "next/dynamic";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import Slider from "react-slick";
import VitalisButton from "../../UI/VitalisButton";
import Image from "next/image";

const GoodsInfo = () => {
  // Reference for controlling the slider
  const sliderRef = useRef<any | null>(null);

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    // ✅ Responsive Breakpoints
    responsive: [
      {
        breakpoint: 1025, // Screens smaller than 1024px
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768, // Screens smaller than 1024px
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640, // Screens smaller than 640px (mobile)
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const cards = [
    { id: 1, text: "Card 1" },
    { id: 2, text: "Card 2" },
    { id: 3, text: "Card 3" },
    { id: 4, text: "Card 4" },
    { id: 5, text: "Card 5" },
    { id: 6, text: "Card 6" },
  ];

  return (
    <div className="flex flex-col items-center pt-[87px] px-0 xs:px-4">
      <div className="flex flex-col w-full max-w-7xl">
        {/* ✅ Title + Navigation in One Row */}
        <div className="flex justify-between items-center pb-[41px]">
          <h6 className="text-gray-900 text-xl sm:text-2xl font-bold text-left pl-4">
            Жіноче здоров’я
          </h6>

          {/* ✅ Buttons Positioned Here */}
          <div className="flex items-center">
            <div className="text-gray-900 mx-3 hidden sm:flex">Продуктів ({cards.length})</div>
            <div className="flex gap-3 pr-4">
              <button
                onClick={() => sliderRef.current?.slickPrev()} // ✅ Correctly reference slider
                className="bg-transparent border-2 border-green-700 text-green-700 p-3 rounded-2xl hover:bg-green-700 hover:text-white transition-all"
              >
                <FaChevronLeft size={14} />
              </button>
              <button
                onClick={() => sliderRef.current?.slickNext()} // ✅ Correctly reference slider
                className="bg-transparent border-2 border-green-700 text-green-700 p-3 rounded-2xl hover:bg-green-700 hover:text-white transition-all"
              >
                <FaChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Slider */}
        <div className="slider-container mt-0 sm:mt-4 relative">
          <Slider ref={sliderRef} {...settings}>
            {cards.map((card) => (
              <div key={card.id} className="px-2">
                <div className="group flex flex-col justify-between items-center rounded-3xl p-3 shadow-md cursor-pointer h-[478px] bg-center bg-cover relative" style={{ backgroundImage: "url('/Goods/goodcard.png')" }}>
                </div>
              </div>
            ))}
          </Slider>
        </div>
        <div className="flex flex-col-reverse sm:flex-row items-center sm:justify-between mt-4 sm:mt-[46px] ">
          {/* Button */}
          <VitalisButton innerText="Більше продуктів" />

          {/* Two-line text with ellipsis */}
          <p className="text-gray-900 leading-relaxed sm:max-w-[320px] text-sm line-clamp-2 overflow-hidden text-ellipsis text-center sm:text-right">
            Lorem ipsum dolor sit amet consectetur. In porta vitae eget volutpat
            blandit ac duis odio
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoodsInfo;
