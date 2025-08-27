import AudioPlayer from '@/app/(anon)/reports/[id]/components/AudioPlayer';
import StatusBadge from '@/app/(anon)/reports/[id]/components/StatusBadge';
import { ReportStatus } from '@/types/report';

interface AudioFileSectionProps {
  status: ReportStatus;
  selectedQuestion: any;
  reportId: string;
}

export default function AudioFileSection({
  status,
  selectedQuestion,
  reportId,
}: AudioFileSectionProps) {
  return (
    <div className="w-full p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-200 flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="text-slate-800 text-lg font-bold leading-snug">면접 음성 파일</div>
          <StatusBadge status={status} />
        </div>
        <div className="text-slate-500 text-sm font-normal leading-none">
          질문을 클릭하여 음성파일을 확인해보세요.
        </div>
      </div>

      {/* 음성 - 선택된 질문의 녹음 파일 사용 */}
      {selectedQuestion && (
        <AudioPlayer
          key={`${reportId}-${selectedQuestion.order}`}
          questionNumber={`Q${selectedQuestion.order}`}
          questionText={selectedQuestion.question}
          audioUrl={
            selectedQuestion.order
              ? `/assets/audios/${reportId}/recording_${reportId}_${selectedQuestion.order}.mp3`
              : undefined
          }
          disabled={!selectedQuestion.order}
          className="self-stretch"
        />
      )}
    </div>
  );
}
