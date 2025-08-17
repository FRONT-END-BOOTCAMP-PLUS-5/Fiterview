'use client';

import Arrow from '@/public/assets/icons/arrow-right.svg';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { NoneReports } from './NoneReports';

type PendingReport = {
  id: number;
  title: string;
};

export default function PendingInterviewsList() {
  const [reports, setReports] = useState<PendingReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingReports = async () => {
      try {
        const response = await axios.get('/api/reports?userId=3&status=PENDING');
        if (response.data.success) {
          setReports(response.data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch pending reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingReports();
  }, []);
  return (
    <section className="flex-1 self-stretch inline-flex flex-col justify-start items-start gap-8 min-h-0">
      <div className="self-stretch flex flex-col justify-start items-start gap-2">
        <h2 className="self-stretch justify-start text-slate-800 text-3xl font-semibold">
          나의 대기 면접
        </h2>
        <div className="self-stretch justify-start text-slate-500 text-sm font-normal">
          생성된 면접 중 아직 응시하지 않은 면접을 시작해보세요.
        </div>
      </div>

      <div className="self-stretch flex flex-col justify-start items-start gap-4 overflow-y-auto max-h-[calc(100vh-220px)] pr-1 hide-scrollbar">
        {loading ? (
          <div className="self-stretch text-center py-8 text-slate-500">로딩 중...</div>
        ) : reports.length === 0 ? (
          <NoneReports />
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="self-stretch h-20 p-6 bg-gradient-to-r from-blue-500/25 via-blue-300/10 to-white/30 hover:bg-gradient-to-r hover:from-white/30 hover:via-blue-300/10 hover:to-blue-500/25 rounded-xl outline-1 outline-offset-[-1px] outline-slate-200 flex justify-between items-center transition-all duration-1000 ease-in-out cursor-pointer"
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
    </section>
  );
}
