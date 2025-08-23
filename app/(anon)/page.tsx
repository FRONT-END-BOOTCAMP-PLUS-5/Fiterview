import FastFiterviewStart from '@/app/(anon)/home/components/FastFiterviewStart';
import FiterviewPrepare from '@/app/(anon)/home/components/FiterviewPrepare';
import FiterviewStart from '@/app/(anon)/home/components/FiterviewStart';
import FiterviewStrength from './home/components/FiterviewStrength';
import MicVisualizer from './interview/[id]/components/user/MicVisualizer';

export default function Page() {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <MicVisualizer active={true} />
      <FastFiterviewStart />
      <FiterviewPrepare />
      <FiterviewStrength />
      <FiterviewStart />
    </div>
  );
}
