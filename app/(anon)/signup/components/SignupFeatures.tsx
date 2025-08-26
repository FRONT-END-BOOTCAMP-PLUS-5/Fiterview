import MicIcon from '@/public/assets/icons/mic.svg';
import BrainIcon from '@/public/assets/icons/brain.svg';
import ChartIcon from '@/public/assets/icons/bar-chart.svg';

export default function SignupFeatures() {
  return (
    <div className="w-1/2 bg-[#3B82F6] text-white p-20 flex justify-center items-center">
      <div className="w-[480px] h-[242px] flex flex-col gap-8">
        <div className="flex flex-col gap-6">
          <p className="text-[28px] leading-[33.6px] font-gmarket font-medium text-center">
            핏터뷰 AI의 특별함
          </p>
          <div className="flex flex-col gap-5">
            {/* Feature 1 */}
            <div className="inline-flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#629BF8] flex items-center justify-center">
                <MicIcon className="w-6 h-6" />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <p className="text-white text-[18px] font-semibold leading-[21.6px]">
                  실시간 음성 분석
                </p>
                <p className="text-[14px] leading-[16.8px] font-normal text-[#CBD5E1]">
                  AI가 실시간으로 답변을 분석하고 피드백을 제공합니다
                </p>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="inline-flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#629BF8] flex items-center justify-center">
                <BrainIcon className="w-6 h-6" />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <p className="text-[18px] leading-[21.6px] font-semibold">맞춤형 질문 생성</p>
                <p className="text-[14px] leading-[16.8px] font-normal text-[#CBD5E1]">
                  이력서와 채용공고를 분석해 개인화된 질문을 생성합니다
                </p>
              </div>
            </div>
            {/* Feature 3 */}
            <div className="inline-flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#629BF8] flex items-center justify-center">
                <ChartIcon className="w-6 h-6" />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <p className="text-[18px] leading-[21.6px] font-semibold">상세한 분석 리포트</p>
                <p className="text-[14px] leading-[16.8px] font-normal text-[#CBD5E1]">
                  면접 후 상세한 분석과 개선점을 제공받을 수 있습니다
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
