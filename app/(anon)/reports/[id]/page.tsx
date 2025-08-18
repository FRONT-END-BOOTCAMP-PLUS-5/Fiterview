import AIFeedback from './components/AIFeedback';

export default function Page({ params }: { params: { id: string } }) {
  return (
    <div>
      <AIFeedback reportId={parseInt(params.id, 10)} />
    </div>
  );
}
