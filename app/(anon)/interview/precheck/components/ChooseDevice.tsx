'use client';

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
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">연결 기기 선택</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 카메라 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">카메라</label>
          <select
            value={selectedCamera}
            onChange={(e) => handleCameraChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {availableCameras.length === 0 ? (
              <option value="">카메라를 찾을 수 없습니다</option>
            ) : (
              availableCameras.map((camera) => (
                <option key={camera.deviceId} value={camera.deviceId}>
                  {camera.label}
                </option>
              ))
            )}
          </select>
          {availableCameras.length === 0 && (
            <p className="text-sm text-red-500 mt-1">
              카메라가 연결되지 않았거나 권한이 필요합니다
            </p>
          )}
        </div>

        {/* 마이크 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">마이크</label>
          <select
            value={selectedMicrophone}
            onChange={(e) => handleMicrophoneChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {availableMicrophones.length === 0 ? (
              <option value="">마이크를 찾을 수 없습니다</option>
            ) : (
              availableMicrophones.map((microphone) => (
                <option key={microphone.deviceId} value={microphone.deviceId}>
                  {microphone.label}
                </option>
              ))
            )}
          </select>
          {availableMicrophones.length === 0 && (
            <p className="text-sm text-red-500 mt-1">
              마이크가 연결되지 않았거나 권한이 필요합니다
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
