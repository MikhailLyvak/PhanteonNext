import Image from "next/image";

export default function SpiritCard() {
  return (
    <div className="relative w-[314px] h-[362px] xxl:w-[424px] xxl:h-[462px] rounded-2xl shadow-lg flex flex-col items-center justify-end overflow-hidden p-6 transition-all duration-500 ease-in-out group bg-gradient-to-r from-gray-100 to-gray-200 hover:from-blue-300 hover:to-gray-200">
      <div className="absolute inset-0 flex items-center justify-center transition-all -translate-x-6 -translate-y-10 duration-500 ease-in-out group-hover:scale-110 group-hover:-rotate-6">
        <Image
          src="/AnimatedCardsSvgs/Spirit/Image.svg"
          alt="Душа"
          width={254}
          height={373}
          className="object-contain mt-8 w-[180px] h-[200px] xxl:w-[234px] xxl:h-[353px] scale-[1.6]"
        />
      </div>

      <div className="absolute right-0 top-0 h-full flex items-start">
        <Image
          src="/AnimatedCardsSvgs/Spirit/Text.svg"
          alt="Spirit Text"
          width={70}
          height={327}
          className="object-contain w-[50px] h-[240px] xxl:w-[70px] xxl:h-[340px]"
        />
      </div>

      <span className="absolute bottom-8 left-6 text-black text-xl font-bold transition-all duration-300">
        Душа
      </span>

      <button className="absolute bottom-6 right-6 border-2 border-green-600 text-green-600 px-5 py-2 rounded-xl flex items-center gap-2 group-hover:border-black group-hover:text-black transition-all duration-300">
        Детальніше ...
      </button>
    </div>
  );
}
