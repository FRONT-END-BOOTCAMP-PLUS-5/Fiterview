import Logo from '@/public/assets/icons/logo1.svg';
import Subtitle from '@/public/assets/icons/logo-subtitle.svg';

export default function LoginHeader() {
  return (
    <div className="w-1/2 p-20 flex justify-center items-center flex-col">
      <Logo width={256} height={102} className="stroke-0" />
      <Subtitle width={610} height={16.8} className="stroke-0" />
    </div>
  );
}
