import Image from "next/image";

export default function MindCard() {
  return (
    <div className="relative w-[314px] h-[362px] xxl:w-[415px] xxl:h-[462px] rounded-2xl shadow-lg flex flex-col items-center justify-end overflow-hidden p-6 transition-all duration-500 ease-in-out group bg-gradient-to-r to-gray-300 from-gray-100 hover:from-orange-200 hover:to-gray-200">
      <div className="absolute inset-0 right-10 -top-10 flex items-center justify-center transition-all -translate-y-5  group-hover:scale-105 duration-500 ease-in-out  group-hover:-translate-y-7">
        <Image
          src="/AnimatedCardsSvgs/Brain/Brain.svg"
          alt="Розум"
          width={300}
          height={273}
          className="object-cover rounded-2xl w-[200px] h-[170px] xxl:w-[290px] xxl:h-[253px]"
        />
      </div>

      <div className="absolute right-0 top-0 h-full flex items-start">
        <Image
          src="/AnimatedCardsSvgs/Brain/Mind.svg"
          alt="Mind Text"
          width={70}
          height={400}
          className="object-contain w-[50px] h-[220px] xxl:w-[70px] xxl:h-[300px]"
        />
      </div>

      <span className="absolute bottom-8 left-6 text-black text-xl font-bold">
        Розум
      </span>

      <button className="absolute bottom-6 right-6 border-2 border-green-700 text-green-700 px-5 py-2 rounded-xl flex items-center gap-2 group-hover:border-black group-hover:text-black transition-all duration-300">
        Детальніше ...
      </button>
    </div>
  );
}
