import AIFeedback from './components/AIFeedback';
import Reflection from './components/Reflection';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      {/* <AIFeedback reportId={parseInt(id, 10)} /> */}
      <Reflection reportId={parseInt(id, 10)} />
    </div>
  );
}
