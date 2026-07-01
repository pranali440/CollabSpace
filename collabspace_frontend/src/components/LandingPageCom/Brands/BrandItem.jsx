import React from "react";

const BrandItem = ({ title, text, image }) => {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
      <img
        src={image}
        alt={title}
        className="w-20 h-20 mb-4 rounded-full object-cover shadow-md"
      />
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{text}</p>
    </div>
  );
};

export default BrandItem;
