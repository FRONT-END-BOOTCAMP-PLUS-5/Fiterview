'use client';

import QuickInterviewForm from './components/QuickInterviewForm';
import PendingInterviewsList from './components/PendingInterviewsList';

export default function InterviewPage() {
  return (
    <div className="h-dvh px-16 py-10 flex justify-start items-start gap-10">
      <QuickInterviewForm />
      <PendingInterviewsList />
    </div>
  );
}
