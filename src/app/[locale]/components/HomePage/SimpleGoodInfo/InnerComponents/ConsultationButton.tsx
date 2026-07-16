import React from "react";

const ConsultationButton = () => {
  return (
    <div className="hidden lg:flex justify-start items-end">
      <button className="border border-white text-white px-5 py-2 rounded-full font-semibold flex items-center gap-2 hover:bg-white hover:text-black transition-all">
        Отримати консультацію ...
      </button>
    </div>
  );
};

export default ConsultationButton;
