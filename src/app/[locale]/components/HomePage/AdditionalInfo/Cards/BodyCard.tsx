import Image from "next/image";

export default function BodyCard() {
  return (
    <div className="relative w-[314px] h-[362px] xxl:w-[415px] xxl:h-[462px] rounded-2xl shadow-lg flex flex-col items-center justify-end overflow-hidden p-6 transition-all duration-500 ease-in-out group bg-gradient-to-r from-gray-100 to-gray-200 hover:from-teal-300 hover:to-gray-200">
      <div className="absolute inset-0 flex items-center justify-center -translate-x-16 translate-y-20 transition-all duration-300 ease-out  group-hover:translate-y-16 group-hover:-translate-x-12">
        <Image
          src="/AnimatedCardsSvgs/Human/Human.svg"
          alt="Тіло"
          height={462}
          width={424}
          className="object-cover scale-[1.2]"
        />
      </div>

      <div className="absolute right-0 top-0 h-full flex items-start">
        <Image
          src="/AnimatedCardsSvgs/Human/Body.svg"
          alt="Body Text"
          width={70}
          height={400}
          className="object-contain w-[50px] h-[220px] xxl:w-[70px] xxl:h-[300px]"
        />
      </div>

      <span className="absolute bottom-8 left-6 text-black text-xl font-bold">
        Тіло
      </span>

      <button className="absolute bottom-6 right-6 border-2 border-green-700 text-green-700 px-5 py-2 rounded-xl flex items-center gap-2 group-hover:border-black group-hover:text-black transition-all duration-300">
        Детальніше ...
      </button>
    </div>
  );
}
