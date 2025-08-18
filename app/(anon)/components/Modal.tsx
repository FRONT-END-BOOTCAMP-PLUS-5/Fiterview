import Del from '@/public/assets/icons/x.svg';

export default function Modal() {
  return (
    <div className="w-[480px] bg-white rounded-2xl shadow-[0px_8px_32px_0px_rgba(0,0,0,0.13)] inline-flex flex-col justify-start items-start gap-3">
      <div className="self-stretch px-6 pt-6 flex flex-col justify-start items-end gap-4">
        <div className="self-stretch inline-flex justify-between items-start">
          <div className="w-8 h-8 bg-slate-50 rounded-lg flex justify-center items-center">
            <Del width={16} height={16} strokeWidth={1.33} stroke="#94A3B8" />
          </div>
        </div>
      </div>
      <div className="self-stretch px-6 flex flex-col justify-start items-start gap-5"></div>
      <div className="self-stretch p-6 flex flex-col justify-start items-start gap-3"></div>
    </div>
  );
}
