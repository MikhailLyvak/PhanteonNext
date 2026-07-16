import React from "react";
import "./EBalanceProInfo.scss";
import Image from "next/image";

const EBalanceProInfo = () => {
  return (
    <div className="relative rounded-3xl px-6 pt-9 pb-[20px] lg:py-16 text-white lg:mx-4 bg-gradient-to-r from-[#343434] via-[#4E4E4E] to-[#343434]">
      {/* Background Logo */}
      <div className="absolute inset-0 flex justify-center items-center opacity-25 pointer-events-none">
        <Image
          src="/OpacityLogoGray.png"
          alt="Logo"
          width={500}
          height={500}
          className="object-contain max-sm:hidden"
        />
      </div>

      {/* Main Content */}
      <div className="relative flex flex-col lg:flex-row justify-around items-top max-w-7xl mx-auto">
        {/* Left Side: Image */}
        <h5 className="flex lg:hidden justify-center text-xl font-bold mb-4 leading-tight">
          E-Balance Pro
        </h5>
        <div className="flex items-center justify-center max-sm:pb-8 max-sm:pt-4">
          <Image
            src="/Ebalance/E-BlalancePro.png"
            alt="E-BALANCE PRO"
            width={262}
            height={322}
            className="object-cover drop-shadow-xl scale-110"
          />
        </div>

        {/* Right Side: Text & Buttons */}
        <div className="flex flex-col max-w-xl lg:mt-10">
          <h5 className="hidden lg:flex text-xl font-bold mb-4 leading-tight">
            E-Balance Pro
          </h5>
          <p className="text-md leading-relaxed text-center lg:text-start mb-6">
            Lorem ipsum dolor sit amet consectetur. Posuere ornare lorem donec
            arcu. Mauris vulputate integer nunc nibh sit nunc non. Orci
            consequat morbi suspendisse interdum massa. Eu nec quis praesent
            elit platea consectetur integer sed morbi. Volutpat pellentesque
            risus urna quisque. Posuere faucibus sed imperdiet quam.
          </p>
          <div className="flex justify-center lg:justify-start items-end">
            <button className="border lg:border-0 text-white px-5 py-2 rounded-full font-semibold flex items-center gap-2">
              Детальніше ...
            </button>
          </div>
          <div className="flex gap-4 lg:gap-10 mt-12">
            <Image
              src="/Ebalance/GooglePlay.png"
              alt="Google Play"
              width={205}
              height={61}
              className="object-cover drop-shadow-xl"
            />
            <Image
              src="/Ebalance/AppleStore.png"
              alt="App Store"
              width={205}
              height={61}
              className="object-cover drop-shadow-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EBalanceProInfo;
