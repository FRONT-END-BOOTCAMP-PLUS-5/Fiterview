import ReportsHeader from '@/app/(anon)/reports/components/ReportsHeader';
import ReportsContent from '@/app/(anon)/reports/components/ReportsContent';

export default function ReportsPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-8 py-8 flex flex-col justify-start items-center gap-10">
      {/* 헤더 섹션 */}
      <ReportsHeader />

      {/* 메인 컨텐츠 */}
      <ReportsContent />
    </div>
  );
}
