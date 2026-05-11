import { FILLER_TOKENS } from '@/constants/stt';

// STT raw 텍스트에 결정적이고 가역적인 최소 후처리만 적용해 clean 텍스트를 만든다.
// LLM 호출이나 자유 재작성은 사용하지 않는다. raw는 항상 별도로 보존된다.
export class CleanTranscriptionService {
  private readonly fillerSet: Set<string>;
  private readonly fillerRepeatPattern: RegExp;

  constructor(fillerTokens: readonly string[] = FILLER_TOKENS) {
    this.fillerSet = new Set(fillerTokens);
    // 같은 filler 음절의 2회 이상 반복 ("어어", "음음음")도 함께 제거.
    this.fillerRepeatPattern = new RegExp(`^(${fillerTokens.join('|')}){2,}$`);
  }

  clean(rawText: string): string {
    if (!rawText) return '';
    const withoutFillers = this.removeFillers(rawText);
    return this.normalizeWhitespace(withoutFillers);
  }

  private removeFillers(text: string): string {
    return text
      .split(/\s+/)
      .filter((token) => {
        const core = token.replace(/[.,!?…]+$/u, '');
        if (!core) return true;
        if (this.fillerSet.has(core)) return false;
        if (this.fillerRepeatPattern.test(core)) return false;
        return true;
      })
      .join(' ');
  }

  private normalizeWhitespace(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }
}
