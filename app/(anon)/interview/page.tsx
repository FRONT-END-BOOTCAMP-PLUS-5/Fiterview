'use client';

import { useEffect, useState } from 'react';
import TopSection from './components/TopSection';

export default function Page() {
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <>
      <TopSection seconds={seconds} totalSeconds={60} />
    </>
  );
}
