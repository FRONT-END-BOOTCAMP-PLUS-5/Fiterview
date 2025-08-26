'use client';

import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useModalStore } from '@/stores/useModalStore';
import { useSessionUser } from '@/lib/auth/useSessionUser';
import PendingInterviewsList from '@/app/(anon)/interview/components/PendingInterviewsList';
import QuickInterviewForm from '@/app/(anon)/interview/components/QuickInterviewForm';
import LoginModal from '@/app/components/modal/LoginModal';

type PendingReport = {
  id: number;
  title: string;
};

export default function InterviewDashboard() {
  const [reports, setReports] = useState<PendingReport[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentStep, isOpen, openModal } = useModalStore();
  const { user } = useSessionUser();

  const fetchPendingReports = useCallback(async () => {
    if (!user) {
      setReports([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get('/api/reports?status=PENDING', {
        validateStatus: () => true,
      });
      if (response.status === 200 && response.data?.success) {
        setReports(response.data.data || []);
      } else if (response.status === 401) {
        openModal('login');
      } else {
        console.error('pending reports 불러오기 실패:', response.status, response.data);
      }
    } finally {
      setLoading(false);
    }
  }, [user, openModal]);

  useEffect(() => {
    fetchPendingReports();
  }, [fetchPendingReports]);

  return (
    <div className="h-full place-self-stretch px-[208px] py-8 cursor-default">
      <div className="flex flex-col mb-6 gap-2">
        <h1 className="self-stretch justify-start text-[#1E293B] text-[32px] font-semibold">
          AI 면접
        </h1>
        <p className="text-[#64748B] text-[14px]">
          {user ? (
            <>
              포트폴리오/채용공고를 올려 <strong>바로 면접을 시작</strong>하거나,{' '}
              <strong>대기 중인 면접</strong>을 이어서 진행해보세요.
            </>
          ) : (
            <>
              포트폴리오/채용공고를 올려 <strong>바로 면접을 시작</strong>하거나,{' '}
              <strong>대기 중인 면접</strong>을 이어서 진행하려면 로그인이 필요합니다.
            </>
          )}
        </p>
      </div>
      <div className="flex justify-start items-start gap-10">
        <QuickInterviewForm
          onReportCreated={fetchPendingReports}
          onReportCompleted={fetchPendingReports}
          LoginModal={isOpen && currentStep === 'login' ? <LoginModal /> : null}
        />
        <PendingInterviewsList reports={reports} loading={loading} />
      </div>
    </div>
  );
}
