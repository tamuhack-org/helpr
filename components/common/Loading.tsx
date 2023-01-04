import React from 'react';
import { useState, useEffect } from 'react';

import { MoonLoader } from 'react-spinners';

export default function Loading() {
  const [refreshVisible, setRefreshVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setRefreshVisible(true);
    }, 3000);
  });

  return (
    <div>
      <div className="fixed h-full w-screen top-0 left-0 transition-all bg-black bg-opacity-80">
        <div className="flex flex-col h-screen justify-center">
          <div className="flex justify-center">
            <MoonLoader color="#FFFFFF" loading={true} size={50} />
          </div>
          {refreshVisible && (
            <p className="mt-8 text-center text-white">
              Try refreshing the page...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
