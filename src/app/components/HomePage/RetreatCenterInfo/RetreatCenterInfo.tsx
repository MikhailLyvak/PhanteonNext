import React from "react";
import Image from "next/image";

const RetreatCenterInfo = () => {
  return (
    <div className="max-w-7xl flex flex-col-reverse lg:flex-row justify-between items-center gap-10 pt-[40px] lg:pt-[120px] mx-4 xl:mx-auto">
      <div className="flex flex-col max-w-lg items-start">
        <h6 className="text-gray-900 text-4xl font-bold pb-[37px] text-left">
          Ретрит-центр
        </h6>
        <p className="text-gray-900 text-sm leading-relaxed mb-6">
          Lorem ipsum dolor sit amet consectetur. Posuere ornare lorem donec
          arcu. Mauris vulputate integer nunc nibh sit nunc non. Orci consequat
          morbi suspendisse interdum massa. Eu nec quis praesent elit platea
          consectetur integer sed morbi. Volutpat pellentesque risus urna
          quisque. Posuere faucibus sed imperdiet quam.
        </p>
        <p className="text-gray-900 text-sm leading-relaxed mb-6">
          Fringilla amet nisi pharetra sodales. Dolor placerat duis mi
          sollicitudin. Pellentesque ipsum quisque convallis arcu augue.
        </p>

        <div className="flex gap-10 mt-4">
          <div>
            <h3 className="text-gray-600 text-3xl font-bold mb-[5px]">14</h3>
            <p className="text-gray-600 text-sm">Lorem ipsum</p>
          </div>
          <div>
            <h3 className="text-gray-600 text-3xl font-bold mb-[5px]">26</h3>
            <p className="text-gray-600 text-sm">Posuere ornare</p>
          </div>
          <div>
            <h3 className="text-gray-600 text-3xl font-bold mb-[5px]">570</h3>
            <p className="text-gray-600 text-sm">Orci consequat morbi</p>
          </div>
        </div>

        <button className="mt-6  text-white px-6 py-2 rounded-full flex items-center gap-2 text-lg font-semibold bg-gradient-to-r to-[#007E6C] from-[#494949] transition-all ">
          <div className="text-sm">Детальніше</div>
          <div className="pb-[6px]">...</div>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-1 row-span-2 flex items-center justify-center">
          <Image
            src="/RetreatCenter/imageOne.jpg"
            alt="Meeting"
            width={310}
            height={407}
            className="rounded-3xl shadow-lg object-cover"
          />
        </div>

        <div className="flex flex-col gap-4">
          <Image
            src="/RetreatCenter/imageTwo.jpg"
            alt="Student"
            width={321}
            height={273}
            className="rounded-3xl shadow-lg object-cover"
          />
          <Image
            src="/RetreatCenter/imageThree.jpg"
            alt="House"
            width={321}
            height={273}
            className="rounded-3xl shadow-lg object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default RetreatCenterInfo;
