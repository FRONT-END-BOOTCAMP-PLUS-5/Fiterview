import ReportsHeader from '@/app/(anon)/reports/components/ReportsHeader';
import ReportsContent from '@/app/(anon)/reports/components/ReportsContent';

export default function ReportsPage() {
  return (
    <div className="self-stretch h-[1080px] px-52 py-8 inline-flex flex-col justify-start items-start gap-10">
      {/* 헤더 섹션 */}
      <ReportsHeader />

      {/* 메인 컨텐츠 */}
      <ReportsContent />
    </div>
  );
}
