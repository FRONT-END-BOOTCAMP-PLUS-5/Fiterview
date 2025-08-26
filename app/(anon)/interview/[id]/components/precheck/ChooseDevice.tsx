'use client';
import CustomSelect from '@/app/(anon)/interview/[id]/components/precheck/CustomSelect';

interface ChooseDeviceProps {
  availableCameras: { deviceId: string; label: string }[];
  availableMicrophones: { deviceId: string; label: string }[];
  selectedCamera: string;
  selectedMicrophone: string;
  onDeviceChange: (cameraId: string, microphoneId: string) => void;
}

export default function ChooseDevice({
  availableCameras,
  availableMicrophones,
  selectedCamera,
  selectedMicrophone,
  onDeviceChange,
}: ChooseDeviceProps) {
  const handleCameraChange = (cameraId: string) => {
    onDeviceChange(cameraId, selectedMicrophone);
  };

  const handleMicrophoneChange = (microphoneId: string) => {
    onDeviceChange(selectedCamera, microphoneId);
  };

  return (
    <div>
      <div className="flex mb-4 gap-3 items-baseline">
        <h3 className="text-lg font-semibold text-gray-800  cursor-default">연결 기기 선택</h3>
        {availableCameras.length === 0 ||
          (availableMicrophones.length === 0 && (
            <p className="text-sm text-[12px] text-red-500">카메라나 마이크 권한이 필요합니다.</p>
          ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 카메라 선택 */}
        <div>
          <label className="block text-sm font-medium text-[#64748B] mb-2">카메라</label>
          <CustomSelect
            value={selectedCamera}
            options={availableCameras.map((c) => ({ value: c.deviceId, label: c.label }))}
            onChange={(v) => handleCameraChange(v)}
            ariaLabel="카메라 선택"
            placeholder="카메라를 선택하세요"
          />
        </div>

        {/* 마이크 선택 */}
        <div>
          <label className="block text-sm font-medium text-[#64748B] mb-2">마이크</label>
          <CustomSelect
            value={selectedMicrophone}
            options={availableMicrophones.map((m) => ({ value: m.deviceId, label: m.label }))}
            onChange={(v) => handleMicrophoneChange(v)}
            ariaLabel="마이크 선택"
            placeholder="마이크를 선택하세요"
          />
        </div>
      </div>
    </div>
  );
}
