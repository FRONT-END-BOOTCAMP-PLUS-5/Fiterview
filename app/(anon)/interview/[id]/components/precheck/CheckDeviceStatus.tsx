'use client';

import { useEffect, useState } from 'react';
import { DEVICE_STATUS_COLOR, DEVICE_STATUS_TEXT } from '@/constants/devicestatus';
import type { DeviceStatus as Status } from '@/types/interview';

type DeviceInfo = {
  deviceId: string;
  label: string;
};

interface CheckDeviceStatusProps {
  availableCameras: DeviceInfo[];
  availableMicrophones: DeviceInfo[];
  selectedCamera: string;
  selectedMicrophone: string;
  onStatusChange?: (statuses: { mic: Status; cam: Status; net: Status }) => void;
}

function stopStream(stream: MediaStream | null) {
  if (!stream) return;
  for (const track of stream.getTracks()) {
    track.stop();
  }
}

// MediaDevices API를 사용하여 마이크,카메라,네트워크 연결 상태를 확인
export default function CheckDeviceStatus({
  availableCameras,
  availableMicrophones,
  selectedCamera,
  selectedMicrophone,
  onStatusChange,
}: CheckDeviceStatusProps) {
  const [micStatus, setMicStatus] = useState<Status>('checking');
  const [camStatus, setCamStatus] = useState<Status>('checking');
  const [netStatus, setNetStatus] = useState<Status>('checking');

  async function checkMicrophone() {
    try {
      if (!navigator.mediaDevices?.enumerateDevices || !navigator.mediaDevices?.getUserMedia) {
        setMicStatus('not-found');
        return;
      }

      // 선택된 마이크가 있는지 확인
      if (!selectedMicrophone || availableMicrophones.length === 0) {
        setMicStatus('not-found');
        return;
      }

      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: selectedMicrophone },
        });
        setMicStatus('ok');
      } catch (err: unknown) {
        const message = (err as Error)?.name || '';
        if (message === 'NotAllowedError' || message === 'SecurityError') setMicStatus('blocked');
        else if (message === 'NotFoundError' || message === 'OverconstrainedError')
          setMicStatus('not-found');
        else setMicStatus('error');
      } finally {
        stopStream(stream);
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

      // 선택된 카메라가 있는지 확인
      if (!selectedCamera || availableCameras.length === 0) {
        setCamStatus('not-found');
        return;
      }

      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: selectedCamera },
        });
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
  }, [selectedCamera, selectedMicrophone]); // 선택된 장치가 변경될 때마다 재확인

  useEffect(() => {
    onStatusChange?.({ mic: micStatus, cam: camStatus, net: netStatus });
  }, [micStatus, camStatus, netStatus, onStatusChange]);

  return (
    <>
      <div className="flex flex-col p-[24px] gap-[16px] bg-[#FEF9E7] rounded-[8px]">
        <div className="flex items-center justify-between">
          <p className="text-[16px] text-[#92400E] font-semibold cursor-default">
            기기 연결 상태 확인
          </p>
          <button
            onClick={runAll}
            className="px-3 py-1 rounded-[6px] text-[12px] text-[#92400E] border border-[#F59E0B] cursor-pointer"
          >
            재확인
          </button>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-col">
            <p className="text-[#64748B] text-[14px] cursor-default">카메라</p>
            <span className="mt-[8px] flex items-center">
              <span
                className={`rounded-[4px] w-[8px] h-[8px] mr-[6px] ${DEVICE_STATUS_COLOR[camStatus]}`}
              ></span>
              <p className="text-[#64748B] text-[14px] cursor-default">
                {DEVICE_STATUS_TEXT[camStatus]}
              </p>
            </span>
          </div>
          <div className="flex flex-col">
            <p className="text-[#64748B] text-[14px] cursor-default">마이크</p>
            <span className="mt-[8px] flex items-center">
              <span
                className={`rounded-[4px] w-[8px] h-[8px] mr-[6px] ${DEVICE_STATUS_COLOR[micStatus]}`}
              ></span>
              <p className="text-[#64748B] text-[14px] cursor-default">
                {DEVICE_STATUS_TEXT[micStatus]}
              </p>
            </span>
          </div>
          <div className="flex flex-col">
            <p className="text-[#64748B] text-[14px] cursor-default">인터넷</p>
            <span className="mt-[8px] flex items-center">
              <span
                className={`rounded-[4px] w-[8px] h-[8px] mr-[6px] ${DEVICE_STATUS_COLOR[netStatus]}`}
              ></span>
              <p className="text-[#64748B] text-[14px] cursor-default">
                {DEVICE_STATUS_TEXT[netStatus]}
              </p>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
