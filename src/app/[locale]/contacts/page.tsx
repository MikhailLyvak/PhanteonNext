import React from 'react'
import InnerWhiteHeader from '../components/LayoutItems/components/Header/InnerWhiteHeader'
import MyCabinetBreadCrump from '../myCabinet/studyPlatform/components/BreadCrump'
import Image from "next/image";

const page = () => {
  return (
    <>
      <InnerWhiteHeader />
      <div className='pt-[120px]'>
        <div className="max-w-7xl mx-4 lg:mx-auto">
          <MyCabinetBreadCrump currentPageTitle="Про нас" />
          <div className="flex justify-between">
            <div className='flex flex-col lg:w-6/12'>
              <div className='text-gray-800 text-2xl lg:text-3xl font-semibold '>Контакти</div>
              <div className='text-[#898989] text-sm lg:text-base font-medium pt-[25px] lg:pt-[30px]'>Адреса</div>
              <div className='text-gray-800 text-base lg:text-3xl font-semibold pt-[10px]'>бульвар Тараса Шевченка 12, м. Київ</div>
              <div className='text-[#898989] text-sm lg:text-base font-medium pt-[20px] lg:pt-[30px]'>Телефон</div>
              <div className='text-gray-800 text-base lg:text-3xl font-semibold pt-[10px]'>+38 (095) 876-54-31</div>
              <div className='text-[#898989] text-sm lg:text-base font-mediums pt-[10px]'>Пн - Вс: 08:00 - 20:00</div>
              <div className='text-[#898989] text-sm lg:text-base font-medium lg:pt-[30] pt-[20]'>Email</div>
              <div className='text-gray-800 text-base lg:text-3xl font-semibold pt-[10]'>info@mail.com</div>
              <div className='text-gray-800 text-lg font-medium lg:pt-[75] pt-5'>Ми в соц. мережах</div>
              <div className='flex mt-3 gap-3'>
                <a
                  href='https://www.tiktok.com/@vitalisbalance'
                  target='_blank'
                  className='p-3 rounded-full h-[45] bg-[#019D86]'>
                  <Image
                    src="/Contact/X.png"
                    alt="X"
                    width={22}
                    height={22}
                    className="object-contain"
                  />
                </a>
                <a
                  href='https://www.facebook.com/profile.php?id=61574078187030'
                  target='_blank'
                  className='px-4 h-[45] flex rounded-full bg-[#019D86]'>
                  <Image
                    src="/Contact/Facebook.png"
                    alt="facebook"
                    width={13}
                    height={24}
                    className="object-contain"
                  />
                </a>
                <a
                  href='https://www.instagram.com/vitalis.balance/'
                  target='_blank'
                  className='p-3 h-[45] rounded-full bg-[#019D86]'>
                  <Image
                    src="/Contact/In.png"
                    alt="In"
                    width={23}
                    height={22}
                    className="object-contain"
                  />
                </a>
              </div>
            </div>
            <div className='hidden lg:flex flex-col w-5/12 '>
              <div className='text-gray-800 text-3xl font-semibold mb-[30] mr-10'>Потрібна консультація?</div>
              <input
                type="text"
                placeholder="Ваше ім'я"
                className="w-full mt-4 p-4 border rounded-2xl text-gray-800 focus:ring focus:ring-green-300 border-[#B9B9B9]"
              />
              <input
                type="text"
                placeholder="+38 (ХХХ) ХХХ-ХХ-ХХ"
                className="w-full mt-4 p-4 border rounded-2xl text-gray-800 focus:ring focus:ring-green-300 border-[#B9B9B9]"
              />
              <input
                type="text"
                inputMode="email"
                placeholder="Email"
                className="w-full mt-4 p-4 border rounded-2xl text-gray-800 focus:ring focus:ring-green-300 border-[#B9B9B9]"
              />
              <textarea
                placeholder="Повідомлення"
                className="w-full mt-4 p-4 border rounded-2xl text-gray-800 focus:ring focus:ring-green-300 h-[166px] text-left align-top border-[#B9B9B9] resize-none"
              ></textarea>

              <button className='bg-gradient-to-r from-[#494949] to-[#007E6C] rounded-3xl py-4 text-white mt-3'>Відправити</button>
            </div>
          </div>
          <div className=' mt-20 mb-10 lg:mt-28 lg:mb-[100] flex justify-center'>
            <Image
              src="/Contact/Map.png"
              alt="наша локація"
              width={1318}
              height={556}
              className="object-cover  h-[270px] w-full lg:h-[556px] lg:w-[1318px] rounded-3xl"
            />
          </div>
          <div className=' flex lg:hidden flex-col mb-10'>
            <div className='text-gray-800 text-base font-semibold mb-5 mr-10'>Потрібна консультація?</div>
            <input
              type="text"
              placeholder="Ваше ім'я"
              className="w-full p-2 border rounded-2xl text-gray-800 focus:ring focus:ring-green-300 border-[#B9B9B9]"
            />
            <input
              type="text"
              placeholder="+38 (ХХХ) ХХХ-ХХ-ХХ"
              className="w-full mt-4 p-2 border rounded-2xl text-gray-800 focus:ring focus:ring-green-300 border-[#B9B9B9]"
            />
            <input
              type="text"
              inputMode="email"
              placeholder="Email"
              className="w-full mt-4 p-2 border rounded-2xl text-gray-800 focus:ring focus:ring-green-300 border-[#B9B9B9]"
            />
            <textarea
              placeholder="Повідомлення"
              className="w-full mt-4 p-4 border rounded-2xl text-gray-800 focus:ring focus:ring-green-300 h-[166px] text-left align-top border-[#B9B9B9] resize-none"
            ></textarea>

            <button className='bg-gradient-to-r from-[#494949] to-[#007E6C] rounded-3xl py-4 text-white mt-3'>Відправити</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default page
