import React from "react";
import "./SaplimentsInfo.scss";
import CardWithSVG from "./CardWithSVG/CardWithSVG";

const SaplimentsInfo = () => {
  return (
    <div className="flex flex-col items-center pt-[78px] mx-4">
      <div className="flex flex-col w-full max-w-7xl">
        <h6 className="text-gray-900 text-xl sm:text-2xl font-bold  pb-[37px] text-left">
          САПЛEМЕНТИ (дієтичні добавки)
        </h6>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
          <CardWithSVG
            srcPath="/TwelveCards/1_Pillow.svg"
            title="Вітамінні комплекси"
          />
          <CardWithSVG
            srcPath="/TwelveCards/2_Minerals.svg"
            title="Мінеральні комплекси"
          />
          <CardWithSVG
            srcPath="/TwelveCards/3_Immune.svg"
            title="Імунітет та Антиоксиданти"
          />
          <CardWithSVG
            srcPath="/TwelveCards/4_Energy.svg"
            title="Енергія й Активність"
          />
          <CardWithSVG
            srcPath="/TwelveCards/5_Antistress.svg"
            title="Антистрес та спокій"
          />
          <CardWithSVG srcPath="/TwelveCards/6_Sleep.svg" title="Міцний Сон" />
          <CardWithSVG
            srcPath="/TwelveCards/7_Women.svg"
            title="Жіноче здоров’я та краса"
          />
          <CardWithSVG
            srcPath="/TwelveCards/8_Men.svg"
            title="Чоловіча сила та витривалість"
          />
          <CardWithSVG
            srcPath="/TwelveCards/9_55Plus.svg"
            title="Золотий вік 55+"
          />
          <CardWithSVG
            srcPath="/TwelveCards/10_Special.svg"
            title="Спеціалізована підтримка"
          />
        </div>
      </div>
    </div>
  );
};

export default SaplimentsInfo;
