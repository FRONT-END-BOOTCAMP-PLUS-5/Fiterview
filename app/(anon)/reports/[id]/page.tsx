import AudioReportViewer from '@/app/(anon)/reports/[id]/components/AudioReportViewer';
import AIFeedback from '@/app/(anon)/reports/[id]/components/AIFeedback';
import Reflection from '@/app/(anon)/reports/[id]/components/Reflection';
import HeaderSection from '@/app/(anon)/reports/[id]/components/HeaderSection';
import DeleteSection from '@/app/(anon)/reports/[id]/components/DeleteSection';

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const reflection = '';

  return (
    <div className="bg-slate-50">
      {/* 헤더 섹션 */}
      <HeaderSection reportId={id} />

      {/* 메인 컨텐츠 */}
      <div className="flex gap-6 py-8 px-16">
        {/* 왼쪽 섹션: AudioReportViewer */}
        <div className="flex-1">
          <AudioReportViewer reportId={id} />
        </div>

        {/* 오른쪽 섹션: AI 피드백과 회고 */}
        <div className="w-[450px] flex flex-col gap-5">
          <AIFeedback reportId={parseInt(id, 10)} />
          <Reflection reportId={parseInt(id, 10)} reflection={reflection} />
        </div>
      </div>

      {/* 삭제 버튼과 모달 */}
      <DeleteSection reportId={id} />
    </div>
  );
}
