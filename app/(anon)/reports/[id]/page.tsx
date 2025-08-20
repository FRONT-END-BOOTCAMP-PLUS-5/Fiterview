import AIFeedback from './components/AIFeedback';

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <div>
      <AIFeedback reportId={parseInt(id, 10)} />
    </div>
  );
}
