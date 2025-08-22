import InterviewClient from '@/app/(anon)/interview/[id]/components/InterviewClient';
import CheckInterview from '@/app/(anon)/interview/[id]/components/precheck/CheckInterview';
import ReflectionModal from '@/app/(anon)/interview/[id]/components/modal/ReflectionModal';
import VideoModal from '@/app/(anon)/interview/[id]/components/modal/VideoModal';

export default function Page() {
  return (
    <>
      <CheckInterview />
      <InterviewClient />
      <ReflectionModal />
      <VideoModal />
    </>
  );
}
