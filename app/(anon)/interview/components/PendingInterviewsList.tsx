'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { NoneReports } from './NoneReports';
import { LoadingSpinner } from '@/app/(anon)/components/LoadingSpinner';
import LoginModal from '@/app/(anon)/components/modal/LoginModal';
import { useModalStore } from '@/stores/useModalStore';
import Arrow from '@/public/assets/icons/arrow-right.svg';

type PendingReport = {
  id: number;
  title: string;
};

export default function PendingInterviewsList() {
  const [reports, setReports] = useState<PendingReport[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { openModal, currentStep, isOpen } = useModalStore();

  useEffect(() => {
    const fetchPendingReports = async () => {
      try {
        const response = await axios.get('/api/reports?status=PENDING');
        if (response.data.success) {
          setReports(response.data.data || []);
        }
      } catch (error) {
        console.error('pending reports 불러오기 실패:', error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            openModal('login');
          } else if (error.response?.status === 403) {
            console.error('권한이 없습니다.');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPendingReports();
  }, [openModal]);
  return (
    <section className="flex-1 self-stretch inline-flex flex-col justify-start items-start">
      <div className="flex flex-col gap-2 mb-4">
        <h2 className="justify-start text-[#1E293B] text-[20px] font-semibold">나의 대기 면접</h2>
      </div>

      <div className="self-stretch flex flex-col justify-start items-start gap-4 overflow-y-auto max-h-[calc(100vh)]">
        {loading ? (
          <LoadingSpinner
            size="medium"
            message="대기 면접을 불러오는 중..."
            className="self-stretch justify-center items-center h-dvh"
          />
        ) : reports.length === 0 ? (
          <NoneReports />
        ) : (
          reports.map((report) => (
            <div
              key={`pending-report-${report.id}`}
              className="self-stretch h-20 p-6 rounded-xl outline-1 outline-offset-[-1px] outline-slate-200 flex justify-between items-center cursor-pointer
                         bg-gradient-to-r from-white/30 via-blue-300/10 to-blue-500/25
                         bg-[length:150%_100%] bg-[position:0%_0%]
                         hover:bg-[position:100%_0%]
                         transition-[background-position] duration-700 ease-out"
              onClick={() => router.push(`/interview/${report.id}`)}
            >
              <div className="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
                <span className="justify-start text-slate-800 text-base font-semibold">
                  {report.title}
                </span>
              </div>
              <div className="rounded-[10px] flex items-center gap-2">
                <Arrow width={18} height={18} strokeWidth={1.67} stroke="#3B82F6" />
                <span className="justify-start text-blue-500 text-sm font-semibold">시작</span>
              </div>
            </div>
          ))
        )}
      </div>

      {isOpen && currentStep === 'login' && <LoginModal />}
    </section>
  );
}
