import FastFiterviewStart from '@/app/(anon)/components/FastFiterviewStart';
import FiterviewPrepare from '@/app/(anon)/components/FiterviewPrepare';
import FiterviewStart from '@/app/(anon)/components/FiterviewStart';
import FiterviewStrength from '@/app/(anon)/components/FiterviewStrength';
export default function Page() {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <FastFiterviewStart />
      <FiterviewPrepare />
      <FiterviewStrength />
      <FiterviewStart />
    </div>
  );
}
