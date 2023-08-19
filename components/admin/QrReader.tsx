import React, { useEffect, useState } from 'react';
import { MdClose } from 'react-icons/md';
import { QrScanner } from '@yudiel/react-qr-scanner';

const QrReader = () => {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [data, setData] = useState('');

  return (
    <>
      <button className="py-4 px-8 bg-blue-500 text-white font-bold rounded-xl shadow-xl w-1/2"
        onClick={() => setScannerOpen(true)}>
        Scan User
      </button>
      {scannerOpen &&
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-[rgba(0,0,0,0.7)] z-10 select-none">
          <MdClose size={25} className="absolute top-6 right-6 hover:scale-105 z-20 text-white cursor-pointer" onClick={() => setScannerOpen(false)} />
          <div className="flex flex-col items-center rounded-lg p-5 shadow-2xl z-20 bg-white w-3/4 lg:w-1/4 h-auto">
            {
              data.length === 0 ?
                <QrScanner
                  onDecode={(result) => setData(result)}
                  onError={(error) => console.log(error?.message)}
                /> :
                <div className="text-xs">
                  {data}
                </div>
            }
          </div>
        </div>
      }
    </>
  )
};

export default QrReader;