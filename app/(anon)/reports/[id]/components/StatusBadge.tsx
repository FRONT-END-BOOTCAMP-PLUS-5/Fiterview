'use client';

import { ReportStatus } from '@/types/report';

interface StatusBadgeProps {
  status: ReportStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = (status: ReportStatus) => {
    switch (status) {
      case 'COMPLETED':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-600',
          label: '분석 완료',
        };
      case 'ANALYZING':
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-600',
          label: '분석 중',
        };
      case 'PENDING':
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-600',
          label: '미응시',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className={`h-6 px-2 rounded-xl flex justify-center items-center ${config.bgColor}`}>
      <div className={`text-xs font-medium leading-none ${config.textColor}`}>{config.label}</div>
    </div>
  );
}
