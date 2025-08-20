import AudioReportViewer from '@/app/(anon)/reports/[id]/components/AudioReportViewer';
import AIFeedback from './components/AIFeedback';
import Reflection from './components/Reflection';

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AudioReportViewer reportId={id} />;
  //   <AIFeedback reportId={parseInt(id, 10)} />

  const reflection = '';

  return (
    <div>
      {/* <AIFeedback reportId={parseInt(id, 10)} /> */}
      <Reflection reflection={reflection} />
    </div>
  );
}
