import React from 'react';

export const Banner = () => {
  return (
    <a
      href="https://hh24.tamuhack.org/"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="absolute flex justify-center items-center py-6 px-8 h-8 top-0 w-screen bg-blue-500 ">
        <p className="text-white font-bold">Visit our live site!</p>
      </div>
    </a>
  );
};
