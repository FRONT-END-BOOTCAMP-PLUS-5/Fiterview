'use client';

import { useEffect, useState } from 'react';

type Status = 'checking' | 'ok' | 'blocked' | 'not-found' | 'offline' | 'error';

function stopStream(stream: MediaStream | null) {
  if (!stream) return;
  for (const track of stream.getTracks()) {
    track.stop();
  }
}

// MediaDevices API를 사용하여 마이크,카메라,네트워크 연결 상태를 확인
export default function CheckDeviceStatus() {
  const [micStatus, setMicStatus] = useState<Status>('checking');
  const [camStatus, setCamStatus] = useState<Status>('checking');
  const [netStatus, setNetStatus] = useState<Status>('checking');

  async function checkMicrophone() {
    try {
      if (!navigator.mediaDevices?.enumerateDevices || !navigator.mediaDevices?.getUserMedia) {
        setMicStatus('not-found');
        return;
      }

      /*
      enumerateDevices : 사용 가능한 미디어 장치 목록 반환 
      */
      const devices = await navigator.mediaDevices.enumerateDevices(); // 반환값 : device.kind, device.label, device.deviceId
      const hasMic = devices.some((d) => d.kind === 'audioinput'); // d.kind에는 audioinput(마이크), videoinput(카메라) 있음
      if (!hasMic) {
        setMicStatus('not-found');
        return;
      }

      /* 
      getUserMedia : 미디어 장치 접근 권한 요청 및 미디어 스트림 반환
      */
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicStatus('ok');
      } catch (err: unknown) {
        const message = (err as Error)?.name || '';
        if (message === 'NotAllowedError' || message === 'SecurityError') setMicStatus('blocked');
        else if (message === 'NotFoundError' || message === 'OverconstrainedError')
          setMicStatus('not-found');
        else setMicStatus('error');
      } finally {
        stopStream(stream); //스트림은 즉시 track.stop() 호출하여 종료
      }
    } catch {
      setMicStatus('error');
    }
  }

  async function checkCamera() {
    try {
      if (!navigator.mediaDevices?.enumerateDevices || !navigator.mediaDevices?.getUserMedia) {
        setCamStatus('not-found');
        return;
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCam = devices.some((d) => d.kind === 'videoinput');
      if (!hasCam) {
        setCamStatus('not-found');
        return;
      }

      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCamStatus('ok');
      } catch (err: unknown) {
        const message = (err as Error)?.name || '';
        if (message === 'NotAllowedError' || message === 'SecurityError') setCamStatus('blocked');
        else if (message === 'NotFoundError' || message === 'OverconstrainedError')
          setCamStatus('not-found');
        else setCamStatus('error');
      } finally {
        stopStream(stream);
      }
    } catch {
      setCamStatus('error');
    }
  }

  async function checkNetwork() {
    try {
      if (!navigator.onLine) {
        setNetStatus('offline');
        return;
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000); //5초 요청 후 취소
      try {
        // 인터넷 연결 상태 확인
        const res = await fetch(`/assets/icons/frame.svg?t=${Date.now()}`, {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal,
        });
        setNetStatus(res.ok ? 'ok' : navigator.onLine ? 'error' : 'offline');
      } catch {
        setNetStatus('offline');
      } finally {
        clearTimeout(timer);
      }
    } catch {
      setNetStatus('error');
    }
  }

  /*
  장치 연결 상태 재확인 함수
  */
  async function runAll() {
    setMicStatus('checking');
    setCamStatus('checking');
    setNetStatus('checking');
    await Promise.allSettled([checkMicrophone(), checkCamera(), checkNetwork()]);
  }

  useEffect(() => {
    runAll();

    function handleOnline() {
      checkNetwork();
    }
    function handleOffline() {
      setNetStatus('offline');
    }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  function statusColor(s: Status) {
    switch (s) {
      case 'ok':
        return 'bg-[#10B981]';
      case 'checking':
        return 'bg-[#F59E0B]';
      case 'blocked':
      case 'offline':
      case 'error':
        return 'bg-[#EF4444]';
      case 'not-found':
        return 'bg-slate-300';
      default:
        return 'bg-slate-300';
    }
  }

  function statusText(s: Status) {
    switch (s) {
      case 'ok':
        return '정상';
      case 'checking':
        return '확인 중';
      case 'blocked':
        return '권한 거부';
      case 'not-found':
        return '장치 없음';
      case 'offline':
        return '오프라인';
      case 'error':
        return '오류';
      default:
        return '';
    }
  }

  return (
    <>
      <div className="flex flex-col p-[24px] gap-[16px] bg-[#FEF9E7] rounded-[8px]">
        <div className="flex items-center justify-between">
          <p className="text-[16px] text-[#92400E] font-semibold">기기 연결 상태 확인</p>
          <button
            onClick={runAll}
            className="px-3 py-1 rounded-[6px] text-[12px] text-[#92400E] border border-[#F59E0B]"
          >
            재확인
          </button>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-col">
            <p className="text-[#64748B] text-[14px]">카메라</p>
            <span className="mt-[8px] flex items-center">
              <span
                className={`rounded-[4px] w-[8px] h-[8px] mr-[6px] ${statusColor(camStatus)}`}
              ></span>
              <p className="text-[#64748B] text-[14px]">{statusText(camStatus)}</p>
            </span>
          </div>
          <div className="flex flex-col">
            <p className="text-[#64748B] text-[14px]">마이크</p>
            <span className="mt-[8px] flex items-center">
              <span
                className={`rounded-[4px] w-[8px] h-[8px] mr-[6px] ${statusColor(micStatus)}`}
              ></span>
              <p className="text-[#64748B] text-[14px]">{statusText(micStatus)}</p>
            </span>
          </div>
          <div className="flex flex-col">
            <p className="text-[#64748B] text-[14px]">인터넷</p>
            <span className="mt-[8px] flex items-center">
              <span
                className={`rounded-[4px] w-[8px] h-[8px] mr-[6px] ${statusColor(netStatus)}`}
              ></span>
              <p className="text-[#64748B] text-[14px]">{statusText(netStatus)}</p>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
