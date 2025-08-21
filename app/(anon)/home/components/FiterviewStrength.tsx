import Brain from '@/public/assets/icons/brain.svg';
import Chat from '@/public/assets/icons/message-circle.svg';
import Target from '@/public/assets/icons/target.svg';

export default function FiterviewStrength() {
  return (
    <div className="w-full px-[120px] py-20 bg-[#F8FAFC] inline-flex flex-col justify-center items-center gap-12">
      <div className="self-stretch flex flex-col justify-start items-center">
        <h2 className="text-[#1E293B] text-[32px] font-bold leading-10">
          왜 핏터뷰를 선택해야 할까요?
        </h2>
      </div>
      <div className="w-full flex justify-between items-start">
        <StrengthCard
          icon={<Brain width={28} height={28} stroke="#475569" strokeWidth={2.33} />}
          title="종합 AI 분석"
          description={
            <>
              포트폴리오와 채용공고를 함께 분석하여 <br />
              정확하고 맞춤화된 면접 질문을 생성합니다
            </>
          }
        />
        <StrengthCard
          icon={<Chat width={28} height={28} stroke="#3B82F6" opacity={0.7} strokeWidth={2.33} />}
          title="실시간 피드백"
          description={
            <>
              답변에 대한 피드백과 개선점을 제공하여
              <br />
              면접 실력을 향상시킵니다
            </>
          }
        />
        <StrengthCard
          icon={<Target width={28} height={28} stroke="#3B82F6" strokeWidth={2.33} />}
          title="실전 같은 연습"
          description={
            <>실제 면접 환경과 유사한 조건에서 연습하여 본 면접에서의 긴장감을 줄입니다</>
          }
        />
      </div>
    </div>
  );
}

function StrengthCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
}) {
  return (
    <div className="w-[360px] p-8 rounded-[16px] flex flex-col items-start gap-5 bg-white">
      <div className={`w-14 h-14 bg-[#F8FAFC] rounded-[12px] flex justify-center items-center`}>
        {icon}
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-[#1E293B] text-[20px] font-semibold leading-tight">{title}</p>
        <p className="text-[#64748B] text-[16px] leading-snug">{description}</p>
      </div>
    </div>
  );
}
