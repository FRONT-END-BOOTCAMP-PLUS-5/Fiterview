'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// 인터뷰 페이지를 벗어나면 브라우저에서 열린 모든 마이크/카메라 스트림과 AudioContext를 강제로 닫아 아이콘을 꺼주는 전역 정리기
function installMediaSentinel() {
  if (typeof window === 'undefined') return;
  if ((window as any).__mediaSentinelInstalled) return;

  (window as any).__mediaReg = new Set<MediaStream>();

  // getUserMedia로 열려있는 스트림을 복사해 저장
  const md = navigator.mediaDevices;
  if (md?.getUserMedia) {
    const orig = md.getUserMedia.bind(md);
    md.getUserMedia = async (constraints: MediaStreamConstraints) => {
      const stream = await orig(constraints);
      (window as any).__mediaReg.add(stream);
      return stream;
    };
  }
  // getUserMedia로 열려있는 스트림을 복사해 저장 (Firefox,Safari,구형 Chrome)
  ['getUserMedia', 'webkitGetUserMedia', 'mozGetUserMedia'].forEach((k) => {
    const fn = (navigator as any)[k];
    if (typeof fn === 'function') {
      const orig = fn.bind(navigator);
      (navigator as any)[k] = (c: any, ok: any, err: any) =>
        orig(
          c,
          (s: MediaStream) => {
            (window as any).__mediaReg.add(s);
            ok?.(s);
          },
          err
        );
    }
  });

  // 이미 복사된 것이므로 중복 방지
  (window as any).__mediaSentinelInstalled = true;
}

// stop() 메서드를 호출해 모든 스트림을 종료
function stopRegisteredMediaAndAudio() {
  try {
    const reg = (window as any).__mediaReg as Set<MediaStream> | undefined;
    if (reg) {
      for (const s of Array.from(reg)) {
        try {
          s.getTracks().forEach((t) => t.stop());
        } catch {}
        reg.delete(s);
      }
    }
  } catch {}
}

export default function MediaStreamCleanup() {
  const pathname = usePathname();

  useEffect(() => {
    installMediaSentinel();

    const cleanupAll = () => {
      stopRegisteredMediaAndAudio();
    };

    const isInterviewIdPage = /^\/interview\/[^/]+$/.test(pathname ?? '');
    if (!isInterviewIdPage) cleanupAll(); // /interview/[id] 페이지가 아닌 경우 정리

    window.addEventListener('pagehide', cleanupAll); // 탭 이탈하는 경우
    window.addEventListener('beforeunload', cleanupAll); // 브라우저 종료하는 경우
    return () => {
      window.removeEventListener('pagehide', cleanupAll);
      window.removeEventListener('beforeunload', cleanupAll);
    };
  }, [pathname]);

  return null;
}
