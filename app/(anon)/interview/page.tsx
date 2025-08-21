import QuickInterviewForm from './components/QuickInterviewForm';
import PendingInterviewsList from './components/PendingInterviewsList';
import ReflectionModal from './components/modal/ReflectionModal';

export default function InterviewPage() {
  return (
    <div className="h-full px-[104px] py-10 ">
      <div className="flex flex-col mb-6 gap-2">
        <h1 className="self-stretch justify-start text-[#1E293B] text-[32px] font-semibold">
          AI 면접
        </h1>
        <p className="text-[#64748B] text-[14px]">
          포트폴리오/채용공고를 올려 <strong>바로 면접을 시작</strong>하거나,{' '}
          <strong>대기 중인 면접</strong>을 이어서 진행해보세요.
        </p>
      </div>
      <div className="flex justify-start items-start gap-10">
        <QuickInterviewForm />
        <PendingInterviewsList />
      </div>
      <ReflectionModal />
    </div>
  );
}
