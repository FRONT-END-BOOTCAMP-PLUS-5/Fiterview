export default function ReportsHeader() {
  return (
    <div className="self-stretch flex flex-col justify-start items-start gap-4">
      <div className="self-stretch flex flex-col justify-start items-start gap-2">
        <div className="self-stretch justify-start text-slate-800 text-3xl font-bold leading-loose">
          기록
        </div>
        <div className="self-stretch justify-start text-slate-500 text-base font-normal leading-tight">
          음성 녹음을 기반으로 면접 스크립트를 자동 생성하고 개선점을 제안받으세요
        </div>
      </div>
    </div>
  );
}
