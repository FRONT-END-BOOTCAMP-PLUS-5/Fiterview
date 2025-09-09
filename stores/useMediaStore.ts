import { create } from 'zustand';
import { DeviceStatus } from '@/types/interview';

type Device = { deviceId: string; label: string };

function stop(stream: MediaStream | null) {
  if (!stream) return;
  for (const t of stream.getTracks()) t.stop();
}

type MediaState = {
  // 목록/선택
  cameras: Device[];
  mics: Device[];
  selectedCamId?: string;
  selectedMicId?: string;

  // 상태/스트림
  camStatus: DeviceStatus;
  micStatus: DeviceStatus;
  netStatus: DeviceStatus;
  camStream: MediaStream | null;
  micStream: MediaStream | null;

  // 액션
  initDevices: () => Promise<void>;
  setSelectedCam: (id?: string) => void;
  setSelectedMic: (id?: string) => void;
  startCam: () => Promise<void>;
  startMic: () => Promise<void>;
  stopCam: () => void;
  stopMic: () => void;
  checkNetwork: () => Promise<void>;
  runAllChecks: () => Promise<void>;
  cleanup: () => void;
};

export const useMediaStore = create<MediaState>((set, get) => ({
  cameras: [],
  mics: [],
  camStatus: 'checking',
  micStatus: 'checking',
  netStatus: 'checking',
  camStream: null,
  micStream: null,

  initDevices: async () => {
    try {
      let micOk = false;
      let camOk = false;

      try {
        const tmp = await navigator.mediaDevices.getUserMedia({ audio: true });
        micOk = true;
        stop(tmp);
      } catch (e: any) {
        console.log('장치 연결 실패');
      }

      try {
        const tmp = await navigator.mediaDevices.getUserMedia({ video: true });
        camOk = true;
        stop(tmp);
      } catch (e: any) {
        console.log('장치 연결 실패');
      }
      // 최소 한 쪽이라도 허용되었을 때만 열거
      const devices = await navigator.mediaDevices.enumerateDevices();

      const cams = camOk
        ? devices
            .filter((d) => d.kind === 'videoinput')
            .map((d) => ({
              deviceId: d.deviceId,
              label: d.label || `카메라 ${d.deviceId.slice(0, 8)}`,
            }))
        : [];

      const mics = micOk
        ? devices
            .filter((d) => d.kind === 'audioinput')
            .map((d) => ({
              deviceId: d.deviceId,
              label: d.label || `마이크 ${d.deviceId.slice(0, 8)}`,
            }))
        : [];

      set({
        cameras: cams,
        mics,
        selectedCamId: cams.length ? (get().selectedCamId ?? cams[0].deviceId) : undefined,
        selectedMicId: mics.length ? (get().selectedMicId ?? mics[0].deviceId) : undefined,
      });
    } catch (e: any) {
      const name = e?.name || '';
      const to = (n: string): DeviceStatus =>
        n === 'NotAllowedError' || n === 'SecurityError'
          ? 'blocked'
          : n === 'NotFoundError' || n === 'OverconstrainedError'
            ? 'not-found'
            : 'error';
      set({ camStatus: to(name), micStatus: to(name) });
    }
  },

  setSelectedCam: (id) => set({ selectedCamId: id }),
  setSelectedMic: (id) => set({ selectedMicId: id }),

  startCam: async () => {
    const { selectedCamId, camStream } = get();
    stop(camStream);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: selectedCamId
          ? { deviceId: { exact: selectedCamId }, width: { exact: 1280 }, height: { exact: 720 } }
          : { width: { exact: 1280 }, height: { exact: 720 } },
        audio: false,
      });
      set({ camStream: s, camStatus: 'ok' });
    } catch (e: any) {
      const n = e?.name || '';
      set({
        camStream: null,
        camStatus:
          n === 'NotAllowedError' || n === 'SecurityError'
            ? 'blocked'
            : n === 'NotFoundError' || n === 'OverconstrainedError'
              ? 'not-found'
              : 'error',
      });
    }
  },

  startMic: async () => {
    const { selectedMicId, micStream } = get();
    stop(micStream);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        audio: selectedMicId ? { deviceId: { exact: selectedMicId } } : true,
        video: false,
      });
      set({ micStream: s, micStatus: 'ok' });
    } catch (e: any) {
      const n = e?.name || '';
      set({
        micStream: null,
        micStatus:
          n === 'NotAllowedError' || n === 'SecurityError'
            ? 'blocked'
            : n === 'NotFoundError' || n === 'OverconstrainedError'
              ? 'not-found'
              : 'error',
      });
    }
  },

  stopCam: () => {
    stop(get().camStream);
    set({ camStream: null });
  },
  stopMic: () => {
    stop(get().micStream);
    set({ micStream: null });
  },

  checkNetwork: async () => {
    if (!navigator.onLine) return set({ netStatus: 'offline' });
    try {
      const c = new AbortController();
      setTimeout(() => c.abort(), 5000);
      const r = await fetch('/assets/icons/frame.svg?t=' + Date.now(), {
        cache: 'no-store',
        signal: c.signal,
      });
      set({ netStatus: r.ok ? 'ok' : 'error' });
    } catch {
      set({ netStatus: 'offline' });
    }
  },

  runAllChecks: async () => {
    set({ micStatus: 'checking', camStatus: 'checking', netStatus: 'checking' });
    await Promise.allSettled([get().startMic(), get().startCam(), get().checkNetwork()]);
  },

  cleanup: () => {
    stop(get().micStream);
    stop(get().camStream);
    set({ micStream: null, camStream: null });
  },
}));
