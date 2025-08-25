import type { DeviceStatus } from '@/types/interview';

export const DEVICE_STATUS_TEXT: Record<DeviceStatus, string> = {
  ok: '정상',
  checking: '확인 중',
  blocked: '권한 거부',
  'not-found': '장치 없음',
  offline: '오프라인',
  error: '오류',
};

export const DEVICE_STATUS_COLOR: Record<DeviceStatus, string> = {
  ok: 'bg-[#3B82F6]',
  checking: 'bg-[#F59E0B]',
  blocked: 'bg-[#EF4444]',
  'not-found': 'bg-slate-300',
  offline: 'bg-[#EF4444]',
  error: 'bg-[#EF4444]',
};
