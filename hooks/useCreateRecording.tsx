import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export type CreateRecordingVars = {
  reportId: number;
  order: number;
  blob: Blob;
};

export type CreateRecordingResponse = {
  success: boolean;
  fileName?: string;
  error?: string;
};

export function useCreateRecording() {
  return useMutation<CreateRecordingResponse, Error, CreateRecordingVars>({
    mutationFn: async ({ reportId, order, blob }) => {
      const extension = blob.type.includes('webm') ? 'webm' : 'mp3';
      const file = new File([blob], `recording_${reportId}_${order}.${extension}`, {
        type: blob.type || 'audio/mpeg',
      });
      const formData = new FormData();
      formData.append('audio', file);

      const url = `/api/reports/${reportId}/questions/${order}/recording`;
      const res = await axios.post<CreateRecordingResponse>(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (!res.data?.success) {
        throw new Error(res.data?.error || '녹음 업로드 실패');
      }
      return res.data;
    },
    retry: 0,
  });
}
