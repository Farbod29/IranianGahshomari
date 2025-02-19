// src/app/ClocksPage/page.tsx
'use client';
import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// Dynamically import ReactClock with SSR disabled
const ReactClockNoSSR = dynamic(
  () => import('@/components/react-clock/ReactClock'),
  { ssr: false }
);

const ClocksPageMiniForMobile = () => {
  // Initialize the clock size with a default value
  const [clockSize, setClockSize] = useState<number>(90);
  const [containerSize, setContainerSize] = useState<number>(110); // Initialize container size

  useEffect(() => {
    // This function will determine the clock size and set it using the state
    function determineClockSize(): number {
      const screenWidth = window.innerWidth;

      if (screenWidth <= 480) {
        return 80;
      } else if (screenWidth <= 768) {
        return 100;
      } else if (screenWidth <= 1800) {
        return 120;
      }
      return 140; // Return default size if no condition is met
    }

    function determineContainerSize(clockSize: number): number {
      return clockSize + 16; // Add 30 to the clock size for the container size
    }

    const newClockSize = determineClockSize();
    setClockSize(newClockSize);
    setContainerSize(determineContainerSize(newClockSize));

    const handleResize = () => {
      const resizedClockSize = determineClockSize();
      setClockSize(resizedClockSize);
      setContainerSize(determineContainerSize(resizedClockSize));
    };
    window.addEventListener('resize', handleResize);

    // Cleanup the event listener when the component unmounts
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className='p-2 bg-transparent'>
      <div className='flex flex-row items-center justify-center'>
        <div className='flex flex-col items-center'>
          <div
            className='flex items-center justify-center rounded-full border-8 border-[#707070] bg-white'
            style={{
              width: `${containerSize}px`,
              height: `${containerSize}px`,
            }}
          >
            <ReactClockNoSSR timeZone='Asia/Tehran' size={clockSize} />
          </div>

          <div className='text-white text-sm mt-2'>ایران</div>
        </div>
      </div>
    </div>
  );
};

export default ClocksPageMiniForMobile;
