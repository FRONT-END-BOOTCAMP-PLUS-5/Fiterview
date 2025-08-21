import FastFiterviewStart from '@/app/(anon)/home/components/FastFiterviewStart';
import FiterviewPrepare from '@/app/(anon)/home/components/FiterviewPrepare';
import FiterviewStart from '@/app/(anon)/home/components/FiterviewStart';

export default function Page() {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <FastFiterviewStart />
      <FiterviewPrepare />
      <FiterviewStart />
    </div>
  );
}
