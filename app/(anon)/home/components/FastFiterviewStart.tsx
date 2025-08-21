import FilesUpload from '@/app/(anon)/home/components/FilesUpload';

export default function FastFiterviewStart() {
  return (
    <section className="px-[120px] py-[80px] flex flex-col w-full text-center gap-4 items-center">
      <h1 className="text-[48px]" style={{ fontFamily: 'var(--font-gmarket)' }}>
        핏터뷰와 함께하는 맞춤형 면접 준비
      </h1>
      <p className="text-[#64748B] text-[18px] leading-relaxed">
        포트폴리오와 채용공고 이미지를 업로드하면 핏터뷰가 맞춤형 면접 질문을 생성하고, <br /> 실제
        면접처럼 연습할 수 있습니다.
      </p>
      <FilesUpload />
    </section>
  );
}
