import React from 'react';
import { useState, useEffect } from 'react';
import Banner from './Banner';
import { MoonLoader } from 'react-spinners';

export default function Loading() {
  const [refreshVisible, setRefreshVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setRefreshVisible(true);
    }, 6000);
  });

  return (
    <div>
      <Banner />
      <div className="h-screen flex justify-center items-center">
        <div>
          <div className="flex justify-center">
            <MoonLoader color="#000000" loading={true} size={50} />
          </div>
          {refreshVisible && (
            <p className="mt-8 text-center">Try refreshing the page...</p>
          )}
        </div>
      </div>
    </div>
  );
}
