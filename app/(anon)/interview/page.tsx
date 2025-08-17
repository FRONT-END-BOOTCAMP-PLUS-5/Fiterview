'use client';

import QuickInterviewForm from './components/QuickInterviewForm';
import PendingInterviewsList from './components/PendingInterviewsList';

export default function InterviewPage() {
  return (
    <div className="px-16 pt-10 flex justify-start items-start gap-10">
      <QuickInterviewForm />
      <PendingInterviewsList />
    </div>
  );
}
