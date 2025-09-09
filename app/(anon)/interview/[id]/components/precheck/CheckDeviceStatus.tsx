'use client';

import { useEffect } from 'react';
import { DEVICE_STATUS_COLOR, DEVICE_STATUS_TEXT } from '@/constants/devicestatus';
import { useMediaStore } from '@/stores/useMediaStore';
import Notice from '@/public/assets/icons/notice.svg';
import NoticeDeviceAuth from '@/app/(anon)/interview/[id]/components/precheck/NoticeDeviceAuth';

// MediaDevices 상태 표시
export default function CheckDeviceStatus() {
  const { camStatus, micStatus, netStatus, runAllChecks, checkNetwork } = useMediaStore();

  const handleRecheck = async () => {
    if (camStatus === 'blocked' || micStatus === 'blocked') {
    } else {
      await runAllChecks();
    }
  };
  // 네트워크 상태만 이벤트 기반으로 갱신 (디바이스 검사는 부모가 호출)
  useEffect(() => {
    checkNetwork();
    function handleOnline() {
      checkNetwork();
    }
    function handleOffline() {
      checkNetwork();
    }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkNetwork]);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="relative group flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-800 cursor-default">기기 상태 확인</h3>
          <Notice
            width={20}
            height={20}
            strokeWidth={1.6}
            className="stroke-[#6FA5DA] opacity-50 cursor-pointer"
            tabIndex={0}
            aria-describedby="device-auth-tip"
          />
          <div
            id="device-auth-tip"
            role="tooltip"
            className="hidden group-hover:block group-focus-within:block"
          >
            <NoticeDeviceAuth />
          </div>
        </div>
        <button
          onClick={handleRecheck}
          className="px-3 py-1 rounded-[6px] text-[12px] font-medium text-[#64748B] border border-[#E2E8F0] border-solid hover:bg-[#F1F5F9] transition-colors duration-200 cursor-pointer"
        >
          재확인
        </button>
      </div>
      <div className="flex flex-col p-[24px] gap-[16px] bg-slate-50 rounded-[8px]">
        <div className="flex justify-between">
          <div className="flex flex-col">
            <p className="text-[#64748B] text-[14px] cursor-default">카메라</p>
            <span className="mt-[8px] flex items-center">
              <span
                className={`rounded-[4px] w-[8px] h-[8px] mr-[6px] ${DEVICE_STATUS_COLOR[camStatus]}`}
              ></span>
              <p className="w-[96px] text-[#64748B] text-[14px] cursor-default">
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
              <p className="w-[96px] text-[#64748B] text-[14px] cursor-default">
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
              <p className="w-[96px] text-[#64748B] text-[14px] cursor-default">
                {DEVICE_STATUS_TEXT[netStatus]}
              </p>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
