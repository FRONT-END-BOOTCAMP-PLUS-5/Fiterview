'use client';

import { useCallback, useState, useEffect } from 'react';
import CheckCircle from '@/public/assets/icons/check-circle.svg';
import NoticeList from '@/app/(anon)/interview/[id]/components/precheck/NoticeList';
import CheckDeviceStatus from '@/app/(anon)/interview/[id]/components/precheck/CheckDeviceStatus';
import ChooseDevice from '@/app/(anon)/interview/[id]/components/precheck/ChooseDevice';

type DeviceInfo = {
  deviceId: string;
  label: string;
};
export default function CheckInterview() {
  const [started, setStarted] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<DeviceInfo[]>([]);
  const [availableMicrophones, setAvailableMicrophones] = useState<DeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('');

  const handleDeviceChange = (cameraId: string, microphoneId: string) => {
    setSelectedCamera(cameraId);
    setSelectedMicrophone(microphoneId);
  };
  const handleStart = useCallback(() => {
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        setTimeout(() => ctx.close().catch(() => {}), 0);
      }
    } catch (_) {}
    // TTS 활성화 신호 브로드캐스트
    window.dispatchEvent(new CustomEvent('fiterview:start'));
    setStarted(true);
  }, []);

  // 공통 장치 목록 가져오기 로직
  useEffect(() => {
    const getDevices = async () => {
      try {
        // 사용자에게 미디어 권한 요청 (장치 라벨을 가져오기 위해)
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

        const devices = await navigator.mediaDevices.enumerateDevices();

        const cameras = devices
          .filter((device) => device.kind === 'videoinput')
          .map((device) => ({
            deviceId: device.deviceId,
            label: device.label || `카메라 ${device.deviceId.slice(0, 8)}`,
          }));

        const microphones = devices
          .filter((device) => device.kind === 'audioinput')
          .map((device) => ({
            deviceId: device.deviceId,
            label: device.label || `마이크 ${device.deviceId.slice(0, 8)}`,
          }));

        setAvailableCameras(cameras);
        setAvailableMicrophones(microphones);

        // 기본값 설정
        if (cameras.length > 0) {
          setSelectedCamera(cameras[0].deviceId);
        }
        if (microphones.length > 0) {
          setSelectedMicrophone(microphones[0].deviceId);
        }
      } catch (error) {
        console.error('장치 목록을 가져올 수 없습니다:', error);
      }
    };

    getDevices();
  }, []);

  if (started) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-white">
      <div className="flex flex-col w-[800px] p-12  bg-white rounded-[16px] gap-[32px]">
        <section className="flex flex-col justify-center items-center ">
          <div className="w-[64px] h-[64px] bg-[#3B82F6] rounded-[32px] flex justify-center items-center">
            <div className="w-[32px] h-[32px] flex justify-center items-center">
              <CheckCircle className="text-white" />
            </div>
          </div>
          <p className=" text-[#1E293B] text-[24px] font-bold mt-[16px] cursor-default">
            면접 시작 전 확인사항
          </p>
          <p className=" text-[#64748B] text-[16px] font-normal mt-[8px] cursor-default">
            원할한 면접 진행을 위해 아래 내용을 확인해주세요
          </p>
          <NoticeList />
        </section>
        <section>
          <ChooseDevice
            availableCameras={availableCameras}
            availableMicrophones={availableMicrophones}
            selectedCamera={selectedCamera}
            selectedMicrophone={selectedMicrophone}
            onDeviceChange={handleDeviceChange}
          />
        </section>
        <section>
          <CheckDeviceStatus
            availableCameras={availableCameras}
            availableMicrophones={availableMicrophones}
            selectedCamera={selectedCamera}
            selectedMicrophone={selectedMicrophone}
          />
        </section>
        <button
          type="button"
          disabled={false}
          onClick={handleStart}
          className="px-5 py-2.5 rounded-md bg-black text-white hover:bg-gray-800"
        >
          시작하기
        </button>
      </div>
    </div>
  );
}
