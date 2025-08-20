import AIFeedback from './components/AIFeedback';
import Reflection from './components/Reflection';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const reflection = '';

  return (
    <div>
      {/* <AIFeedback reportId={parseInt(id, 10)} /> */}
      <Reflection reflection={reflection} />
    </div>
  );
}
