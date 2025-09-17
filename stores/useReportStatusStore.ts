import { create } from 'zustand';
import apiClient from '@/lib/api/axiosInstance';
import { ReportStatus } from '@/types/report';

interface ReportStatusState {
  currentStatus: ReportStatus; // 현재 리포트 상태 저장
  setStatus: (status: ReportStatus) => void; // 로컬 상태 업데이트하는 동기함수
  updateReportStatus: (reportId: string, status: ReportStatus) => Promise<void>; // 서버와 통신하여 리포트 상태 업데이트하는 비동기 함수
}

// 스토어 생성
export const useReportStatusStore = create<ReportStatusState>((set, get) => ({
  currentStatus: 'PENDING', // 초기 상태는 PENDING으로 설정

  setStatus: (status: ReportStatus) => {
    set({ currentStatus: status });
  },

  updateReportStatus: async (reportId: string, status: ReportStatus) => {
    try {
      const response = await apiClient.put(`/api/reports/${reportId}`, { status });

      set({ currentStatus: status });
    } catch (error) {
      console.error('Failed to update report status:', error);
    }
  },
}));
