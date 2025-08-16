'use client';

import Upload from '@/public/assets/icons/upload.svg';
import Picture from '@/public/assets/icons/image.svg';
import Del from '@/public/assets/icons/x.svg';

export default function InterviewPage() {
  return (
    <div>
      <div className="px-16 pt-10 flex justify-start items-start gap-10">
        <div className="flex-1 inline-flex flex-col justify-start items-start gap-10">
          <div className="self-stretch flex flex-col justify-start items-start gap-8">
            <div className="flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-slate-800 text-3xl font-semibold">
                빠른 AI 면접
              </div>
              <p className="text-slate-500 text-sm">포트폴리오나 채용공고를 업로드해보세요</p>
            </div>
            <div className="self-stretch inline-flex justify-start items-start gap-8">
              <div className="flex-1 h-48 bg-white rounded-xl outline-2 outline-offset-[-2px] outline-slate-300 inline-flex flex-col justify-center items-center gap-4">
                <div className="flex flex-col justify-start items-center gap-2">
                  <Upload width={48} height={48} strokeWidth={30} />
                  <p className="text-center justify-start text-slate-600 text-base font-semibold  leading-tight">
                    포트폴리오 업로드
                  </p>
                  <p className="text-center justify-start text-slate-400 text-sm font-normal  leading-none">
                    PDF 파일
                  </p>
                </div>
              </div>
              <div className="flex-1 h-48 bg-sky-50 rounded-xl outline outline-2 outline-offset-[-2px] outline-sky-500 inline-flex flex-col justify-center items-center gap-4">
                <div className="flex flex-col justify-start items-center gap-2">
                  <Picture width={48} height={48} strokeWidth={1} />
                  <p className="text-center justify-start text-sky-900 text-base font-semibold  leading-tight">
                    채용공고 업로드
                  </p>
                  <p className="text-center justify-start text-sky-700 text-sm font-normal  leading-none">
                    캡처 이미지 (선택사항)
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="self-stretch flex-1 flex flex-col justify-start items-start gap-6">
            <div className="self-stretch flex flex-col justify-start items-start gap-6">
              <div className="self-stretch flex flex-col justify-start items-start gap-2">
                <div className="self-stretch justify-start text-slate-800 text-xl font-semibold  leading-normal">
                  업로드된 파일
                </div>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="self-stretch p-3 bg-slate-100 rounded-lg inline-flex justify-start items-center gap-3">
                      <div className="flex-1 flex justify-start items-start gap-0.5">
                        <div className="justify-start text-slate-800 text-sm font-medium  leading-none">
                          김개발_포트폴리오.pdf
                        </div>
                        <Del />
                      </div>
                    </div>
                    <div className="self-stretch p-3 bg-slate-100 rounded-lg inline-flex justify-start items-center gap-3">
                      <div className="flex-1 inline-flex flex-col justify-start items-start gap-0.5">
                        <div className="justify-start text-slate-800 text-sm font-medium  leading-none">
                          네이버_프론트엔드_채용공고.png
                        </div>
                      </div>
                      <div className="flex justify-start items-center gap-2">
                        <div className="w-4 h-4 relative border-emerald-500" />
                        <div className="w-4 h-4 relative border-red-500 overflow-hidden">
                          <div className="w-2 h-2 left-[4px] top-[4px] absolute outline outline-[1.33px] outline-offset-[-0.67px] outline-zinc-500" />
                          <div className="w-2 h-2 left-[4px] top-[4px] absolute outline outline-[1.33px] outline-offset-[-0.67px] outline-zinc-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="self-stretch h-14 bg-blue-500 rounded-xl inline-flex justify-center items-center gap-3">
              <div className="w-5 h-5 relative border-white overflow-hidden">
                <div className="w-4 h-4 left-[1.67px] top-[1.67px] absolute outline outline-[1.67px] outline-offset-[-0.83px] outline-white" />
                <div className="w-0 h-[3.33px] left-[16.67px] top-[2.50px] absolute outline outline-[1.67px] outline-offset-[-0.83px] outline-white" />
                <div className="w-[3.33px] h-0 left-[15px] top-[4.17px] absolute outline outline-[1.67px] outline-offset-[-0.83px] outline-white" />
                <div className="w-0 h-[1.67px] left-[3.33px] top-[14.17px] absolute outline outline-[1.67px] outline-offset-[-0.83px] outline-white" />
                <div className="w-[1.67px] h-0 left-[2.50px] top-[15px] absolute outline outline-[1.67px] outline-offset-[-0.83px] outline-white" />
              </div>
              <div className="justify-start text-white text-base font-semibold  leading-tight">
                맞춤 면접 질문 생성하기
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 self-stretch inline-flex flex-col justify-start items-start gap-8">
          <div className="self-stretch flex flex-col justify-start items-start gap-2">
            <div className="self-stretch justify-start text-slate-800 text-3xl font-semibold  leading-loose">
              나의 대기 면접
            </div>
            <div className="self-stretch justify-start text-slate-500 text-sm font-normal  leading-none">
              생성된 면접 중 아직 응시하지 않은 면접을 시작해보세요.
            </div>
          </div>
          <div className="self-stretch flex flex-col justify-start items-start gap-4">
            <div className="self-stretch h-16 flex flex-col justify-start items-start gap-6">
              <div className="self-stretch h-20 p-6 bg-gradient-to-l from-white/30 via-blue-300/10 to-blue-500/25 rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-200 inline-flex justify-between items-center">
                <div className="flex-1 flex justify-start items-center gap-4">
                  <div className="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
                    <div className="justify-start text-slate-800 text-base font-semibold  leading-tight">
                      네이버 프론트엔드 개발자 면접
                    </div>
                  </div>
                </div>
                <div className="w-20 h-9 rounded-[10px] flex justify-end items-center gap-2">
                  <div className="w-4 h-4 relative border-blue-500 overflow-hidden">
                    <div className="w-2.5 h-0 left-[3.75px] top-[9px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-blue-500" />
                    <div className="w-1.5 h-2.5 left-[9px] top-[3.75px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-blue-500" />
                  </div>
                  <div className="justify-start text-blue-500 text-sm font-semibold  leading-none">
                    시작
                  </div>
                </div>
              </div>
            </div>
            <div className="self-stretch h-16 p-6 bg-gradient-to-l from-white/30 via-blue-300/10 to-blue-500/25 rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-200 inline-flex justify-between items-center">
              <div className="flex-1 flex justify-start items-center gap-4">
                <div className="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
                  <div className="justify-start text-slate-800 text-base font-semibold  leading-tight">
                    네이버 프론트엔드 개발자 면접
                  </div>
                </div>
              </div>
              <div className="w-20 h-9 rounded-[10px] flex justify-end items-center gap-2">
                <div className="w-4 h-4 relative border-blue-500 overflow-hidden">
                  <div className="w-2.5 h-0 left-[3.75px] top-[9px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-blue-500" />
                  <div className="w-1.5 h-2.5 left-[9px] top-[3.75px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-blue-500" />
                </div>
                <div className="justify-start text-blue-500 text-sm font-semibold  leading-none">
                  시작
                </div>
              </div>
            </div>
            <div className="self-stretch h-16 p-6 bg-gradient-to-l from-white/30 via-blue-300/10 to-blue-500/25 rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-200 inline-flex justify-between items-center">
              <div className="flex-1 flex justify-start items-center gap-4">
                <div className="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
                  <div className="justify-start text-slate-800 text-base font-semibold  leading-tight">
                    네이버 프론트엔드 개발자 면접
                  </div>
                </div>
              </div>
              <div className="w-20 h-9 rounded-[10px] flex justify-end items-center gap-2">
                <div className="w-4 h-4 relative border-blue-500 overflow-hidden">
                  <div className="w-2.5 h-0 left-[3.75px] top-[9px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-blue-500" />
                  <div className="w-1.5 h-2.5 left-[9px] top-[3.75px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-blue-500" />
                </div>
                <div className="justify-start text-blue-500 text-sm font-semibold  leading-none">
                  시작
                </div>
              </div>
            </div>
            <div className="self-stretch h-16 p-6 bg-gradient-to-l from-white/30 via-blue-300/10 to-blue-500/25 rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-200 inline-flex justify-between items-center">
              <div className="flex-1 flex justify-start items-center gap-4">
                <div className="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
                  <div className="justify-start text-slate-800 text-base font-semibold  leading-tight">
                    네이버 프론트엔드 개발자 면접
                  </div>
                </div>
              </div>
              <div className="w-20 h-9 rounded-[10px] flex justify-end items-center gap-2">
                <div className="w-4 h-4 relative border-blue-500 overflow-hidden">
                  <div className="w-2.5 h-0 left-[3.75px] top-[9px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-blue-500" />
                  <div className="w-1.5 h-2.5 left-[9px] top-[3.75px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-blue-500" />
                </div>
                <div className="justify-start text-blue-500 text-sm font-semibold  leading-none">
                  시작
                </div>
              </div>
            </div>
            <div className="self-stretch h-16 p-6 bg-gradient-to-l from-white/30 via-blue-300/10 to-blue-500/25 rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-200 inline-flex justify-between items-center">
              <div className="flex-1 flex justify-start items-center gap-4">
                <div className="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
                  <div className="justify-start text-slate-800 text-base font-semibold  leading-tight">
                    네이버 프론트엔드 개발자 면접
                  </div>
                </div>
              </div>
              <div className="rounded-[10px] flex justify-end items-center gap-2">
                <div className="w-4 h-4 relative border-blue-500 overflow-hidden">
                  <div className="w-2.5 h-0 left-[3.75px] top-[9px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-blue-500" />
                  <div className="w-1.5 h-2.5 left-[9px] top-[3.75px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-blue-500" />
                </div>
                <div className="justify-start text-blue-500 text-sm font-semibold  leading-none">
                  시작
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
