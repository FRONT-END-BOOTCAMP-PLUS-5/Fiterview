'use client';

import { useState, useEffect } from 'react';
import UserDashboard from '@/app/(anon)/reports/components/UserDashboard';
import ReportsList from '@/app/(anon)/reports/components/ReportsList';

export default function ReportsContent() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/reports', {
          credentials: 'include',
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setReports(result.data || []);
          }
        }
      } catch (error) {
        console.error('리포트 조회 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="self-stretch h-full p-10 bg-white rounded-xl  flex flex-col justify-start items-start gap-10">
      {/* 사용자 대시보드 */}
      <UserDashboard reports={reports} />

      {/* 리포트 목록 */}
      <ReportsList reports={reports} loading={loading} />
    </div>
  );
}
