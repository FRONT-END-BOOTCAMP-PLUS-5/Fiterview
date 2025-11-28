import { ProgressStep } from '@/types/progress';

export function getCopy(
  step?: ProgressStep,
  sampleMessageIndex?: number
): { title: string; description: string; icon: string } {
  switch (step) {
    case 'started':
      return {
        title: '분석 준비 중',
        description: '업로드한 파일을 확인하고 있어요.',
        icon: '📋',
      };
    case 'extracting':
      return {
        title: '파일 분석 중',
        description: '문서에서 주요 정보를 추출하고 있어요.',
        icon: '🔍',
      };
    case 'generating': {
      const samples = [
        'AI가 맞춤 질문을 생성하고 있어요.',
        '지원자의 경험을 분석 중입니다.',
        '면접에 꼭 필요한 질문을 준비하고 있어요.',
      ];
      return {
        title: '질문 생성 중',
        description: samples[sampleMessageIndex ?? 0],
        icon: '💡',
      };
    }
    case 'creating_report':
      return {
        title: '리포트 생성 중',
        description: '리포트를 만드는 중이에요.',
        icon: '📊',
      };
    case 'saving_questions':
      return {
        title: '질문 저장 중',
        description: '생성된 질문을 저장하고 있어요.',
        icon: '💾',
      };
    case 'error':
      return {
        title: '오류 발생',
        description: '작업을 진행할 수 없습니다. 다시 시도해주세요.',
        icon: '❌',
      };
    default:
      return {
        title: '진행 중',
        description: '잠시만 기다려주세요.',
        icon: '⏳',
      };
  }
}

export function getPercent(step?: ProgressStep): number {
  const order: ProgressStep[] = [
    'started',
    'extracting',
    'generating',
    'creating_report',
    'saving_questions',
    'completed',
  ];
  if (!step) return 0;
  const idx = order.indexOf(step);
  if (idx < 0) return 0;
  return Math.round((idx / (order.length - 1)) * 100);
}
