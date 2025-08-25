'use client';

import { useSessionUser } from '@/lib/auth/useSessionUser';

interface UserDashboardProps {
  reports: any[];
}

export default function UserDashboard({ reports }: UserDashboardProps) {
  const { user } = useSessionUser();
  const completedReports = reports.filter((report) => report.status === 'COMPLETED');
  const averageScore =
    completedReports.length > 0
      ? Math.round(
          completedReports.reduce((sum, report) => sum + (report.score || 0), 0) /
            completedReports.length
        )
      : 0;

  return (
    <div className="w-[933px] p-8 bg-slate-50 rounded-2xl flex flex-col justify-start items-start gap-2">
      <div className="self-stretch inline-flex justify-start items-center gap-2">
        <div className="justify-start text-zinc-800 text-2xl font-bold leading-7">
          안녕하세요, {user?.nickname || user?.username || '사용자'}님!
        </div>
        <div className="justify-start text-zinc-800 text-2xl font-normal leading-7">👋</div>
      </div>
      <div className="self-stretch justify-start text-slate-500 text-base font-normal leading-tight">
        핏터뷰의 AI 면접관과 함께 완벽한 면접 준비를 시작해보세요.
      </div>
      <div className="self-stretch inline-flex justify-center items-center gap-20 m-5">
        <div className="inline-flex flex-col justify-start items-center gap-2">
          <div className="justify-start text-blue-500 text-5xl font-bold leading-[57.60px]">
            {completedReports.length}
          </div>
          <div className="justify-start text-slate-500 text-sm font-medium leading-none">
            완료된 면접
          </div>
        </div>
        <div className="inline-flex flex-col justify-start items-center gap-2">
          <div className="inline-flex justify-center items-center gap-2">
            <div className="justify-start text-blue-500 text-5xl font-bold leading-[57.60px]">
              {averageScore}
            </div>
            <div className="justify-start text-slate-500 text-2xl font-medium leading-7">점</div>
          </div>
          <div className="justify-start text-slate-500 text-sm font-medium leading-none">
            평균 점수
          </div>
        </div>
      </div>
    </div>
  );
}
