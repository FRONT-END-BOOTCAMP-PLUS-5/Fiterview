import InterviewClient from '@/app/(anon)/interview/[id]/components/InterviewClient';
import CheckInterview from '@/app/(anon)/interview/[id]/components/precheck/CheckInterview';

export default function Page() {
  return (
    <>
      <CheckInterview />
      <InterviewClient />
    </>
  );
}
