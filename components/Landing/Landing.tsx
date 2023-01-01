import React from 'react';
// import Image from 'next/image';
import CSS from 'csstype';
import { signIn } from 'next-auth/react';

const backgroundProps: CSS.Properties = {
  backgroundImage: 'url(../images/th-cloudy-sky.png)',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};

export default function Landing() {
  return (
    <div
      className="md:items-center h-screen flex justify-center"
      style={backgroundProps}
    >
      <div className="welcomem mt-48 md:mt-0">
        <p className="text-center relative bottom-[20px] font-bold text-4xl sm:text-[65px] pb-8">
          Welcome to HelpR
        </p>
        <p className="text-center font-medium pb-8 text-lg sm:text-2xl">
          A one-stop shop to get help and ask questions
        </p>
        <div className="flex relative justify-center items-center top-[10px]">
          <a
            onClick={() => signIn('google')}
            className="py-4 px-8 bg-blue-500 text-white font-bold rounded-xl shadow-xl cursor-pointer"
          >
            Log in with Google
          </a>
        </div>
      </div>
      <div className="absolute flex justify-center bottom-8 w-full text-center">
        <a
          href="https://tamuhack.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="../images/tamuhack.png" />
        </a>
      </div>
    </div>
  );
}
