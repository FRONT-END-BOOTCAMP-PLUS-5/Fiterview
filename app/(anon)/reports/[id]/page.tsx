import AIFeedback from './components/AIFeedback';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <AIFeedback reportId={parseInt(id, 10)} />
    </div>
  );
}
