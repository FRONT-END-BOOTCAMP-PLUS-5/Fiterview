'use client';
import { useEffect, useState } from 'react';
import CheckCircle from '@/public/assets/icons/check-circle.svg';
import NoticeList from './components/NoticeList';
import CheckList from './components/CheckList';
import CheckDeviceStatus from './components/CheckDeviceStatus';
import ChooseDevice from './components/ChooseDevice';

type DeviceInfo = {
  deviceId: string;
  label: string;
};

export default function PrecheckPage() {
  const [availableCameras, setAvailableCameras] = useState<DeviceInfo[]>([]);
  const [availableMicrophones, setAvailableMicrophones] = useState<DeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('');

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

  const handleDeviceChange = (cameraId: string, microphoneId: string) => {
    setSelectedCamera(cameraId);
    setSelectedMicrophone(microphoneId);
  };

  return (
    <div className="flex flex-col w-full h-full justify-center items-center py-[38px]">
      <div className="flex flex-col w-[800px] p-12 border border-[#E2E8F0] bg-white rounded-[16px] gap-[32px]">
        <section className="flex flex-col justify-center items-center ">
          <div className="w-[64px] h-[64px] bg-[#3B82F6] rounded-[32px] flex justify-center items-center">
            <div className="w-[32px] h-[32px] flex justify-center items-center">
              <CheckCircle />
            </div>
          </div>
          <p className=" text-[#1E293B] text-[24px] font-bold mt-[16px]">면접 시작 전 확인사항</p>
          <p className=" text-[#64748B] text-[16px] font-normal mt-[8px]">
            원할한 면접 진행을 위해 아래 내용을 확인해주세요
          </p>
          <NoticeList />
        </section>
        {/* <section>
          <p className="flex items-start text-[18px] font-semibold text-[#1E293B]">사전 준비사항</p>
          <CheckList />
        </section> */}
        <section>
          <CheckDeviceStatus
            availableCameras={availableCameras}
            availableMicrophones={availableMicrophones}
            selectedCamera={selectedCamera}
            selectedMicrophone={selectedMicrophone}
          />
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
      </div>
    </div>
  );
}
