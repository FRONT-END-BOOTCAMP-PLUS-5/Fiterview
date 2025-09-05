import { useMemo } from 'react';

interface UseTruncateTextOptions {
  maxLength: number;
  suffix?: string;
  text: string;
}

export function useTruncateText(options: UseTruncateTextOptions) {
  const { text, maxLength, suffix = '...' } = options;

  const truncatedText = useMemo(() => {
    if (text.length <= maxLength) {
      return text;
    }

    return text.slice(0, maxLength - suffix.length) + suffix;
  }, [text, maxLength, suffix]);

  const isTruncated = text.length > maxLength;

  return {
    truncatedText,
    originalText: text,
    isTruncated,
  };
}
