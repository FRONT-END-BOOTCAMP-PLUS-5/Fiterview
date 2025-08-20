import AudioReportViewer from '@/app/(anon)/reports/[id]/components/AudioReportViewer';

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AudioReportViewer reportId={id} />;
  //   <AIFeedback reportId={parseInt(id, 10)} />
}
