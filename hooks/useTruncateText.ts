import { useMemo } from 'react';

interface UseTruncateTextOptions {
  maxLength: number;
  suffix?: string;
}

export function useTruncateText(text: string, options: UseTruncateTextOptions) {
  const { maxLength, suffix = '...' } = options;

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
