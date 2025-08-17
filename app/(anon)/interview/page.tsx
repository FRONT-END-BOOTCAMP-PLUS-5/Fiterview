'use client';

import Upload from '@/public/assets/icons/upload.svg';
import Picture from '@/public/assets/icons/image.svg';
import Del from '@/public/assets/icons/x.svg';
import Sparkles from '@/public/assets/icons/sparkles.svg';
import Arrow from '@/public/assets/icons/arrow-right.svg';

export default function InterviewPage() {
  return (
    <div className="px-16 pt-10 flex justify-start items-start gap-10">
      <section className="flex-1 inline-flex flex-col">
        <div className="flex flex-col gap-2 mb-8">
          <h2 className="justify-start text-slate-800 text-3xl font-semibold">빠른 AI 면접</h2>
          <p className="text-slate-500 text-sm">포트폴리오나 채용공고를 업로드해보세요.</p>
        </div>
        <div className="self-stretch flex gap-8 w-full h-[200px]">
          <div className="flex-1 h-full justify-center bg-white rounded-xl outline-2 outline-offset-[-2px] outline-slate-300 inline-flex flex-col">
            <div className="flex flex-col items-center gap-2">
              <Upload width={48} height={48} strokeWidth={2} stroke="#3B82F6" />
              <p className="text-center text-slate-600 text-base font-semibold">
                포트폴리오 업로드
              </p>
              <p className="text-center text-slate-400 text-sm">PDF 파일</p>
            </div>
          </div>
          <div className=" flex-1 h-full justify-center bg-sky-50 rounded-xl outline-2 outline-offset-[-2px] outline-sky-500 inline-flex flex-col">
            <div className="flex flex-col items-center gap-2">
              <Picture width={48} height={48} strokeWidth={2} stroke="#0EA5E9" />
              <p className="text-center text-sky-900 text-base font-semibold">채용공고 업로드</p>
              <p className="text-center text-sky-700 text-sm font-normal">캡처 이미지 (선택사항)</p>
            </div>
          </div>
        </div>
        <div className="self-stretch flex flex-col justify-start items-start gap-6 mt-10">
          <h3 className="self-stretch justify-start text-slate-800 text-xl font-semibold  leading-normal">
            업로드된 파일
          </h3>
          <div className="self-stretch flex flex-col justify-start items-start gap-2">
            <div className="self-stretch p-3 bg-slate-100 rounded-lg inline-flex justify-start items-center gap-3">
              <div className="flex-1 flex justify-between items-start gap-0.5">
                <span className="justify-start text-slate-800 text-sm font-medium  leading-none">
                  김개발_포트폴리오.pdf
                </span>
                <Del width={16} height={16} stroke="#A0A0A0" strokeWidth={1.33} />
              </div>
            </div>
            <div className="self-stretch p-3 bg-slate-100 rounded-lg inline-flex justify-start items-center gap-3">
              <div className="flex-1 flex justify-between items-start gap-0.5">
                <span className="justify-start text-slate-800 text-sm font-medium  leading-none">
                  네이버_프론트엔드_채용공고.png
                </span>
                <Del width={16} height={16} stroke="#A0A0A0" strokeWidth={1.33} />
              </div>
            </div>
          </div>
        </div>
        <button className="self-stretch h-14 bg-blue-500 rounded-xl inline-flex justify-center items-center gap-3 mt-6">
          <Sparkles width={20} height={20} strokeWidth={1.67} stroke="#ffffff" />
          <p className="justify-start text-white text-base font-semibold">
            맞춤 면접 질문 생성하기
          </p>
        </button>
      </section>

      {/* 대기면접 */}
      <section className="flex-1 self-stretch inline-flex flex-col justify-start items-start gap-8">
        <div className="self-stretch flex flex-col justify-start items-start gap-2">
          <h2 className="self-stretch justify-start text-slate-800 text-3xl font-semibold">
            나의 대기 면접
          </h2>
          <div className="self-stretch justify-start text-slate-500 text-sm font-normal">
            생성된 면접 중 아직 응시하지 않은 면접을 시작해보세요.
          </div>
        </div>
        <div className="self-stretch flex flex-col justify-start items-start gap-4">
          <div className="self-stretch h-20 p-6 bg-gradient-to-r from-blue-500/25 via-blue-300/10 to-white/30 hover:bg-gradient-to-r hover:from-white/30 hover:via-blue-300/10 hover:to-blue-500/25 rounded-xl outline-1 outline-offset-[-1px] outline-slate-200 flex justify-between items-center transition-all duration-1000 ease-in-out cursor-pointer">
            <div className="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
              <span className="justify-start text-slate-800 text-base font-semibold">
                네이버 프론트엔드 개발자 면접
              </span>
            </div>
            <div className="rounded-[10px] flex items-center gap-2">
              <Arrow width={18} height={18} strokeWidth={1.67} stroke="#3B82F6" />
              <span className="justify-start text-blue-500 text-sm font-semibold">시작</span>
            </div>
          </div>

          <div className="self-stretch h-20 p-6 bg-gradient-to-r from-blue-500/25 via-blue-300/10 to-white/30 hover:bg-gradient-to-r hover:from-white/30 hover:via-blue-300/10 hover:to-blue-500/25 rounded-xl outline-1 outline-offset-[-1px] outline-slate-200 flex justify-between items-center transition-all duration-1000 ease-in-out cursor-pointer">
            <div className="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
              <span className="justify-start text-slate-800 text-base font-semibold">
                네이버 프론트엔드 개발자 면접
              </span>
            </div>
            <div className="rounded-[10px] flex items-center gap-2">
              <Arrow width={18} height={18} strokeWidth={1.67} stroke="#3B82F6" />
              <span className="justify-start text-blue-500 text-sm font-semibold">시작</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
